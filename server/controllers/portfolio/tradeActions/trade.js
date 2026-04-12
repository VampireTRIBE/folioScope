const mongoose = require("mongoose");

const PortfolioGroupModel = require("../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const FinantialAssetModel = require("../../../models/Portfolio_Models/PortfolioMetrix_Models/finantialAsset");
const LedgerStatementModel = require("../../../models/Portfolio_Models/ledger_Models/ledgerStatement");
const FifoLotModel = require("../../../models/Portfolio_Models/ledger_Models/fifoLedgerStatement");

const {
  is_Leaf,
} = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/IsLeaf");

const {
  getSingleAssetMetaDataID,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  getNAMEIDMAP,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

// =====================================================
// 🔴 CONFIG
// =====================================================
const LOCK_TIMEOUT = 1000 * 60; // 1 minute

// =====================================================
// 🔴 LOCK HELPERS
// =====================================================
const acquireLock = async (assetId, session) => {
  const now = new Date();
  const locked = await FinantialAssetModel.findOneAndUpdate(
    {
      _id: assetId,
      $or: [
        { "lock.isLocked": false },
        { "lock.lockedAt": { $lt: new Date(now - LOCK_TIMEOUT) } },
      ],
    },
    {
      $set: {
        "lock.isLocked": true,
        "lock.lockedAt": now,
      },
    },
    { new: true, session },
  );

  if (!locked) {
    throw new Error("Another transaction is in progress for this asset");
  }
  return locked;
};

const releaseLock = async (assetId) => {
  await FinantialAssetModel.updateOne(
    { _id: assetId },
    {
      $set: {
        "lock.isLocked": false,
      },
    },
  );
};

// =====================================================
// 🔴 Trade Execution
// =====================================================
module.exports.tradeTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  let asset = null;

  try {
    session.startTransaction();

    const u_id = req.user._id;
    const { pg_id, a_id } = req.params;
    const { type, date, qty, price, dividendAmount } = req.body;

    const txDate = new Date(date);

    // ================= VALIDATION =================
    if (!["buy", "sell", "dividend"].includes(type)) {
      throw new Error("Invalid transaction type");
    }

    if (type !== "dividend" && (!qty || !price || qty <= 0 || price <= 0)) {
      throw new Error("Invalid qty or price");
    }

    if (type === "dividend" && (!dividendAmount || dividendAmount <= 0)) {
      throw new Error("Invalid dividend amount");
    }

    // ================= LEAF CHECK =================
    const { userId, isLeaf, path, consolidatedCash } = await is_Leaf(
      PortfolioGroupModel,
      pg_id,
      session,
    );

    if (!isLeaf) throw new Error("Allowed only on leaf nodes");
    if (userId.toString() !== u_id.toString()) throw new Error("Unauthorized");

    // ================= ASSET FETCH =================
    const { name } = getSingleAssetMetaDataID(a_id);
    const { INDEX } = getNAMEIDMAP();

    if (INDEX === a_id.toString()) {
      throw new Error("Cannot transact index directly");
    }

    asset = await FinantialAssetModel.findOne({
      assetMetadataId: a_id,
      portfolioGroupId: pg_id,
      userId: u_id,
    }).session(session);

    // ================= CREATE + LOCK (FIRST BUY) =================
    if (!asset && type === "buy") {
      const created = await FinantialAssetModel.create(
        [
          {
            name,
            assetMetadataId: a_id,
            portfolioGroupId: pg_id,
            userId: u_id,
            dateAdded: txDate,
            lock: { isLocked: true, lockedAt: new Date() },
          },
        ],
        { session },
      );

      asset = created[0];
    } else if (asset) {
      // ================= LOCK =================
      await acquireLock(asset._id, session);
    }

    if (!asset && type !== "buy") {
      throw new Error("Asset does not exist");
    }

    // ================= BACKDATED CHECK =================
    const lastTx = await LedgerStatementModel.findOne()
      .sort({ date: -1 })
      .session(session);

    if (lastTx && txDate <= new Date(lastTx.date)) {
      throw new Error("Backdated or same timestamp transaction not allowed");
    }

    // =====================================================
    // BUY
    // =====================================================
    if (type === "buy") {
      const totalAmount = qty * price;

      if (consolidatedCash < totalAmount) {
        throw new Error("Insufficient funds");
      }

      await FifoLotModel.create(
        [
          {
            financialAssetId: asset._id,
            userId: u_id,
            buyQty: qty,
            remainingQty: qty,
            buyPrice: price,
            buyDate: txDate,
          },
        ],
        { session },
      );

      await LedgerStatementModel.create(
        [
          {
            type: "buy",
            financialAssetId: asset._id,
            portfolioGroupId: pg_id,
            userId: u_id,
            qty,
            price,
            amount: totalAmount,
            date: txDate,
          },
        ],
        { session },
      );

      await PortfolioGroupModel.updateMany(
        { _id: { $in: [...path, pg_id] } },
        { $inc: { consolidatedCash: -totalAmount } },
        { session },
      );
    }

    // =====================================================
    // SELL
    // =====================================================
    if (type === "sell") {
      let remainingToSell = qty;
      let totalSTCG = 0;
      let totalLTCG = 0;
      let totalCost = 0;

      const lots = await FifoLotModel.find({
        financialAssetId: asset._id,
        remainingQty: { $gt: 0 },
      })
        .sort({ buyDate: 1 })
        .session(session);

      for (let lot of lots) {
        if (remainingToSell <= 0) break;

        const usedQty = Math.min(lot.remainingQty, remainingToSell);

        const cost = usedQty * lot.buyPrice;
        const sellValue = usedQty * price;
        const profit = sellValue - cost;
        totalCost += cost;

        const holdingDays =
          (txDate - new Date(lot.buyDate)) / (1000 * 60 * 60 * 24);

        if (holdingDays > 365) totalLTCG += profit;
        else totalSTCG += profit;

        lot.remainingQty -= usedQty;
        remainingToSell -= usedQty;

        await lot.save({ session });
      }

      if (remainingToSell > 0) {
        throw new Error("Insufficient quantity");
      }

      const totalSellAmount = qty * price;

      await LedgerStatementModel.create(
        [
          {
            type: "sell",
            financialAssetId: asset._id,
            portfolioGroupId: pg_id,
            userId: u_id,
            qty,
            price,
            amount: totalSellAmount,

            cost: totalCost,
            profit: totalSTCG + totalLTCG,
            STCG: totalSTCG,
            LTCG: totalLTCG,

            date: txDate,
          },
        ],
        { session },
      );

      await PortfolioGroupModel.updateMany(
        { _id: { $in: [...path, pg_id] } },
        { $inc: { consolidatedCash: totalSellAmount } },
        { session },
      );

      await FinantialAssetModel.updateOne(
        { _id: asset._id },
        {
          $inc: {
            // LIFETIME (REAL SOURCE OF TRUTH)
            "snapshot.lifetime.realizedGain": totalSTCG + totalLTCG,

            // TAX
            "snapshot.tax.STCG": totalSTCG,
            "snapshot.tax.LTCG": totalLTCG,
          },
        },
        { session },
      );
    }

    // =====================================================
    // DIVIDEND
    // =====================================================
    if (type === "dividend") {
      await LedgerStatementModel.create(
        [
          {
            type: "dividend",
            financialAssetId: asset._id,
            portfolioGroupId: pg_id,
            userId: u_id,
            dividendAmount,
            amount: dividendAmount,
            date: txDate,
          },
        ],
        { session },
      );

      await PortfolioGroupModel.updateMany(
        { _id: { $in: [...path, pg_id] } },
        { $inc: { consolidatedCash: dividendAmount } },
        { session },
      );

      await FinantialAssetModel.updateOne(
        { _id: asset._id },
        {
          $inc: {
            "snapshot.lifetime.dividend": dividendAmount,
          },
        },
        { session },
      );
    }

    await session.commitTransaction();
    session.endSession();

    // 🔓 RELEASE LOCK
    await releaseLock(asset._id);
    return { success: true, message: "Transaction Completed", date };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    // 🔓 ENSURE UNLOCK
    if (asset?._id) {
      await releaseLock(asset._id);
    }
    return { success: false, message: error.message };
  }
};
