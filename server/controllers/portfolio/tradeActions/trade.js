const mongoose = require("mongoose");

const PortfolioGroupModel = require("../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const PortfolioGroupStatementModel = require("../../../models/Portfolio_Models/ledger_Models/groupStatement");
const FinantialAssetModel = require("../../../models/Portfolio_Models/PortfolioMetrix_Models/financialAsset");
const LedgerStatementModel = require("../../../models/Portfolio_Models/ledger_Models/ledgerStatement");
const FifoLotModel = require("../../../models/Portfolio_Models/ledger_Models/fifoLedgerStatement");

const { is_Leaf } = require("../../../utils/mongodb/aggregations/check_Leaf");
const {
  get_SingleAssetMetaDataID,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  get_NAMEIDMAP,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");
const {
  fill_MissingNAVs,
} = require("../../../sync_Scripts/sync_Portfolio/fill_MissingNavs");

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
module.exports.tradeTransaction = async (req) => {
  const session = await mongoose.startSession();
  let asset = null;

  try {
    session.startTransaction();

    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;
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
    );

    if (!isLeaf) throw new Error("Allowed only on leaf nodes");
    if (userId.toString() !== userID.toString()) throw new Error("Unauthorized");

    // ================= ASSET FETCH =================
    const { name } = get_SingleAssetMetaDataID(a_id);
    const { INDEX } = get_NAMEIDMAP();

    if (INDEX === a_id.toString()) {
      throw new Error("Cannot transact index directly");
    }

    asset = await FinantialAssetModel.findOne({
      assetMetadataId: a_id,
      portfolioGroupId: pg_id,
      userId: userID,
    });

    // ================= CREATE + LOCK (FIRST BUY) =================
    if (!asset && type === "buy") {
      const created = await FinantialAssetModel.create(
        [
          {
            name,
            assetMetadataId: a_id,
            portfolioGroupId: pg_id,
            userId: userID,
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

    const [lastTx, groupLastStatement] = await Promise.all([
      LedgerStatementModel.findOne({ userId: userID }).sort({ date: -1 }),
      PortfolioGroupStatementModel.findOne({
        userId: userID,
      }).sort({ date: -1 }),
    ]);

    if (lastTx && txDate <= new Date(lastTx.date)) {
      throw new Error("Backdated or same timestamp transaction not allowed");
    }
    if (groupLastStatement && txDate <= new Date(groupLastStatement.date)) {
      throw new Error("Backdated or same timestamp transaction not allowed");
    }

    // ========== FILL PRIVIEWS MISSING NAV =================
    let startDate = null;

    const groupDate = groupLastStatement
      ? new Date(groupLastStatement.date)
      : null;

    const tradeDate = lastTx ? new Date(lastTx.date) : null;

    if (groupDate && tradeDate) {
      startDate = groupDate > tradeDate ? groupDate : tradeDate;
    } else if (groupDate) {
      startDate = groupDate;
    } else if (tradeDate) {
      startDate = tradeDate;
    }
    if (startDate) {
      await fill_MissingNAVs(userID, session, startDate, new Date(date));
    } else {
      await fill_MissingNAVs(userID, session, new Date(date), new Date(date));
    }

    // =====================================================
    // BUY
    // =====================================================
    if (type === "buy") {
      const totalAmount = qty * price;

      if (consolidatedCash < totalAmount) {
        throw new Error("Insufficient funds");
      }

      await Promise.all([
        FifoLotModel.create(
          [
            {
              financialAssetId: asset._id,
              userId: userID,
              buyQty: qty,
              remainingQty: qty,
              buyPrice: price,
              buyDate: txDate,
            },
          ],
          { session },
        ),

        LedgerStatementModel.create(
          [
            {
              type: "buy",
              financialAssetId: asset._id,
              portfolioGroupId: pg_id,
              userId: userID,
              qty,
              price,
              amount: totalAmount,
              date: txDate,
            },
          ],
          { session },
        ),

        PortfolioGroupModel.updateMany(
          { _id: { $in: [...path, pg_id] } },
          { $inc: { consolidatedCash: -totalAmount } },
          { session },
        ),

        FinantialAssetModel.findOneAndUpdate(
          {
            assetMetadataId: a_id,
            portfolioGroupId: pg_id,
            userId: userID,
          },
          {
            $inc: { "snapshot.totalQty": qty },
          },
          { session },
        ),
      ]);
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

        // the hardcoded 365 is needed to handle on the bases of assets category.

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

      await Promise.all([
        LedgerStatementModel.create(
          [
            {
              type: "sell",
              financialAssetId: asset._id,
              portfolioGroupId: pg_id,
              userId: userID,
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
        ),

        PortfolioGroupModel.updateMany(
          { _id: { $in: [...path, pg_id] } },
          {
            $inc: {
              consolidatedCash: totalSellAmount,
              "groupSnapshot.lifetime.realizedGain": totalSTCG + totalLTCG,
            },
          },
          { session },
        ),

        FinantialAssetModel.updateOne(
          { _id: asset._id },
          {
            $inc: {
              "snapshot.lifetime.realizedGain": totalSTCG + totalLTCG,
              "snapshot.tax.STCG": totalSTCG,
              "snapshot.tax.LTCG": totalLTCG,
              "snapshot.totalQty": -qty,
            },
          },
          { session },
        ),
      ]);
    }

    // =====================================================
    // DIVIDEND
    // =====================================================
    if (type === "dividend") {
      await Promise.all([
        LedgerStatementModel.create(
          [
            {
              type: "dividend",
              financialAssetId: asset._id,
              portfolioGroupId: pg_id,
              userId: userID,
              dividendAmount,
              amount: dividendAmount,
              date: txDate,
            },
          ],
          { session },
        ),

        PortfolioGroupModel.updateMany(
          { _id: { $in: [...path, pg_id] } },
          {
            $inc: {
              consolidatedCash: dividendAmount,
              "groupSnapshot.lifetime.dividend": dividendAmount,
            },
          },
          { session },
        ),

        FinantialAssetModel.updateOne(
          { _id: asset._id },
          {
            $inc: {
              "snapshot.lifetime.dividend": dividendAmount,
            },
          },
          { session },
        ),
      ]);
    }

    await session.commitTransaction();
    session.endSession();

    // 🔓 RELEASE LOCK
    await releaseLock(asset._id);
    return { success: true, message: "Transaction Completed", txDate };
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
