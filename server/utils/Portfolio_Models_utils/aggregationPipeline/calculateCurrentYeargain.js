module.exports.updateCurrentYearGainBulk = async ({
  assetIds,
  priceMap,
  startDate,
  session = null,
}) => {
  const start = new Date(startDate);

  // =========================
  // 1. REALIZED + DIVIDEND
  // =========================
  const ledgerAgg = await LedgerStatementModel.aggregate([
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
  ]).session(session);

  const ledgerMap = {};
  for (const row of ledgerAgg) {
    ledgerMap[row._id.toString()] = row;
  }

  // =========================
  // 2. UNREALIZED (FIFO)
  // =========================
  const fifoAgg = await FifoLotModel.aggregate([
    {
      $match: {
        financialAssetId: {
          $in: assetIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        remainingQty: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: "$financialAssetId",
        totalQty: { $sum: "$remainingQty" },
        investmentValue: {
          $sum: { $multiply: ["$remainingQty", "$buyPrice"] },
        },
      },
    },
  ]).session(session);

  const fifoMap = {};
  for (const row of fifoAgg) {
    fifoMap[row._id.toString()] = row;
  }

  // =========================
  // 3. BUILD BULK UPDATE
  // =========================
  const bulkOps = assetIds.map((id) => {
    const idStr = id.toString();

    const ledger = ledgerMap[idStr] || {};
    const fifo = fifoMap[idStr] || {};

    const realized = ledger.realizedGain || 0;
    const dividend = ledger.dividend || 0;

    const qty = fifo.totalQty || 0;
    const investment = fifo.investmentValue || 0;

    const CMP = priceMap[idStr] || 0;
    const currentValue = qty * CMP;

    const unrealized = currentValue - investment;

    const currentYearGain = realized + dividend + unrealized;

    return {
      updateOne: {
        filter: { _id: id },
        update: {
          $set: {
             "snapshot.currentValue": currentValue,
            "snapshot.currentYearGain": currentYearGain,
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await FinantialAssetModel.bulkWrite(bulkOps, { session });
  }
};
