const mongoose = require("mongoose");

const LedgerStatementModel = require("../../../models/Portfolio_Models/ledger_Models/ledgerStatement");
const FifoLotModel = require("../../../models/Portfolio_Models/ledger_Models/fifoLedgerStatement");
const FinantialAssetModel = require("../../../models/Portfolio_Models/PortfolioMetrix_Models/finantialAsset");

const {
  getCurrentFinancialDate,
} = require("../../shared_Utils/helpers/getCurrentFinacialyear");

const { getFinancialAsset } = require("./getAll_financialAssets");
const { getLatestCloses } = require("./getMarketPrice");

// ======================================
// ! Update All Financial Assets
// ======================================
module.exports.updatefinancialCurrentSnapshots = async (
  userId,
  session = null,
  assetobj = null,
) => {
  const start = new Date(getCurrentFinancialDate());
  const assetMap = await getFinancialAsset(userId, session);
  const assetIds = Object.keys(assetMap);
  if (assetIds.length === 0) return;

  // ==================================
  // ! FY REALIZED + DIVIDEND ONLY
  // ==================================

  const [lots, ledgerAgg, priceMap] = await Promise.all([
    FifoLotModel.find({
      financialAssetId: {
        $in: assetIds.map((id) => new mongoose.Types.ObjectId(id)),
      },
      remainingQty: { $gt: 0 },
    }).session(session),

    LedgerStatementModel.aggregate([
      {
        $match: {
          financialAssetId: {
            $in: assetIds.map((id) => new mongoose.Types.ObjectId(id)),
          },
          date: { $gte: start },
        },
      },
      {
        $group: {
          _id: "$financialAssetId",
          realizedGain: {
            $sum: {
              $cond: [{ $eq: ["$type", "sell"] }, "$profit", 0],
            },
          },
          dividend: {
            $sum: {
              $cond: [{ $eq: ["$type", "dividend"] }, "$amount", 0],
            },
          },
        },
      },
    ]).option({ session }),
    getLatestCloses(start, session),
  ]);

  const ledgerMap = {};
  for (const l of ledgerAgg) {
    ledgerMap[l._id.toString()] = l;
  }

  // =====================================================
  // ! LOT CALCULATION
  // =====================================================

  const unrealizedMap = {};
  const currentValueMap = {};
  const qtyMap = {};
  const investmentMap = {};

  for (const lot of lots) {
    const assetId = lot.financialAssetId.toString();
    const metadataId = assetMap[assetId];

    const priceData = priceMap[metadataId];

    if (!priceData || priceData.cmp == null) {
      throw new Error(`Missing CMP for asset ${assetId}`);
    }

    const cmp = priceData.cmp;
    const datedCmp = priceData.datedCmp ?? cmp;

    const qty = lot.remainingQty;
    const buyPrice = lot.buyPrice;

    qtyMap[assetId] = (qtyMap[assetId] || 0) + qty;

    investmentMap[assetId] = (investmentMap[assetId] || 0) + qty * buyPrice;

    currentValueMap[assetId] = (currentValueMap[assetId] || 0) + qty * cmp;

    let unrealized = 0;

    if (new Date(lot.buyDate) < start) {
      unrealized = (cmp - datedCmp) * qty;
    } else {
      unrealized = (cmp - buyPrice) * qty;
    }

    unrealizedMap[assetId] = (unrealizedMap[assetId] || 0) + unrealized;
  }

  // =====================================================
  // ! BULK UPDATE
  // =====================================================

  const bulkOps = assetIds.map((id) => {
    const idStr = id.toString();

    const ledger = ledgerMap[idStr] || {};

    const realized = ledger.realizedGain || 0;
    const dividend = ledger.dividend || 0;

    const unrealized = unrealizedMap[idStr] || 0;
    const currentValue = currentValueMap[idStr] || 0;

    const totalQty = qtyMap[idStr] || 0;
    const investmentValue = investmentMap[idStr] || 0;

    const currentYearGain = realized + dividend + unrealized;

    return {
      updateOne: {
        filter: { _id: new mongoose.Types.ObjectId(id) },
        update: {
          $set: {
            // ! POSITION
            "snapshot.totalQty": totalQty,
            "snapshot.investmentValue": investmentValue,
            "snapshot.currentValue": currentValue,

            // ! FY SNAPSHOT ONLY
            "snapshot.financialYear.realizedGain": realized,
            "snapshot.financialYear.dividend": dividend,
            "snapshot.financialYear.unrealizedGain": unrealized,
            "snapshot.financialYear.totalGain": currentYearGain,
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await FinantialAssetModel.bulkWrite(bulkOps, { session });
  }
  return { result: true };
};
