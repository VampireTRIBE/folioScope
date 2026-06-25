// ! Third Party Packeges
const mongoose = require("mongoose");

// ! Utils
const { get_leafGroupIDsByGroup } = require("../../get_leafGroupIDsByGroup");
const customError = require("../../../../shared/error/customError");

const toObjectId = (id, fieldName) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new customError(`Invalid ${fieldName}`, 400);
  }
  return new mongoose.Types.ObjectId(id);
};

const roundMoney = (value) => Number(Number(value || 0).toFixed(2));
const formatPercent = (value) => `${Number(value || 0).toFixed(2)}%`;
const parsePercent = (value) => {
  if (value == null) return 0;

  const numericValue = Number(value.toString().replace("%", "").trim());
  return Number.isFinite(numericValue) ? numericValue : 0;
};
const formatDate = (value) => {
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const read_LtpByAssetMetadataIds = async ({
  assetMetadataIds = [],
  session = null,
}) => {
  const ASSETPRICEHISTORY_MODEL = mongoose.model("AssetPriceHistory");
  const assetObjectIds = [
    ...new Set(
      assetMetadataIds
        .filter((assetId) => mongoose.Types.ObjectId.isValid(assetId))
        .map((assetId) => assetId.toString()),
    ),
  ].map((assetId) => new mongoose.Types.ObjectId(assetId));

  if (!assetObjectIds.length) return {};

  const query = ASSETPRICEHISTORY_MODEL.aggregate([
    {
      $match: {
        assetId: { $in: assetObjectIds },
      },
    },
    {
      $sort: {
        assetId: 1,
        date: -1,
      },
    },
    {
      $group: {
        _id: "$assetId",
        prices: {
          $push: {
            close: "$close",
            date: "$date",
          },
        },
      },
    },
    {
      $project: {
        prices: { $slice: ["$prices", 2] },
      },
    },
  ]);

  if (session !== null) {
    query.session(session);
  }

  const priceRows = await query;

  return priceRows.reduce((result, row) => {
    const latestPrice = row.prices?.[0]?.close ?? 0;
    const previousPrice = row.prices?.[1]?.close ?? latestPrice;
    const todayChange =
      previousPrice > 0
        ? ((latestPrice - previousPrice) / previousPrice) * 100
        : 0;

    result[row._id.toString()] = {
      price: Number(latestPrice.toFixed(2)),
      today: `${todayChange.toFixed(2)}%`,
      previousPrice: Number(previousPrice.toFixed(2)),
    };

    return result;
  }, {});
};

const readExpenseRatioByAssetMetadataIds = async ({
  assetMetadataIds = [],
  session = null,
}) => {
  const ASSETMETADATA_MODEL = mongoose.model("AssetMetaData");
  const assetObjectIds = [
    ...new Set(
      assetMetadataIds
        .filter((assetId) => mongoose.Types.ObjectId.isValid(assetId))
        .map((assetId) => assetId.toString()),
    ),
  ].map((assetId) => new mongoose.Types.ObjectId(assetId));

  if (!assetObjectIds.length) return {};

  const query = ASSETMETADATA_MODEL.find({
    _id: { $in: assetObjectIds },
  })
    .select("expenseRatio")
    .lean();

  if (session !== null) {
    query.session(session);
  }

  const assetMetadataRows = await query;

  return assetMetadataRows.reduce((result, assetMetadata) => {
    result[assetMetadata._id.toString()] = parsePercent(
      assetMetadata.expenseRatio,
    );
    return result;
  }, {});
};

const addLtpToFinancialAssets = async ({ financialAssets, session = null }) => {
  const assetMetadataIds = financialAssets.map(
    (asset) => asset.assetMetadataId,
  );
  const [ltpByAssetId, expenseRatioByAssetId] = await Promise.all([
    read_LtpByAssetMetadataIds({
      assetMetadataIds,
      session,
    }),
    readExpenseRatioByAssetMetadataIds({
      assetMetadataIds,
      session,
    }),
  ]);

  return financialAssets.map((asset) => {
    const assetMetadataKey = asset.assetMetadataId?.toString();
    const priceData = ltpByAssetId[asset.assetMetadataId?.toString()] || {
      price: 0,
      today: "0.00%",
      previousPrice: 0,
    };
    const qty = Number(asset?.snapshot?.totalQty || 0);
    const invested = roundMoney(asset?.snapshot?.investmentValue);
    const current = roundMoney(qty * priceData.price);
    const avg = qty > 0 ? roundMoney(invested / qty) : 0;
    const oneDayPrice = roundMoney(
      (priceData.price - priceData.previousPrice) * qty,
    );
    const profitLoss = roundMoney(current - invested);
    const profitLossPercentage =
      invested > 0 ? ((current - invested) / invested) * 100 : 0;

    return {
      _id: asset._id,
      name: asset.name || "",
      ltp: {
        price: priceData.price,
        today: priceData.today,
      },
      oneDayPrice,
      oneDayPercentage: priceData.today,
      qty,
      avg,
      profitLoss,
      profitLossPercentage: formatPercent(profitLossPercentage),
      invested,
      current,
      expenseRatioValue: expenseRatioByAssetId[assetMetadataKey] || 0,
    };
  });
};

const buildHoldingsStats = ({ financialAssets, portfolioGroupDoc }) => {
  const todaysGainPrice = roundMoney(
    financialAssets.reduce(
      (total, asset) => total + Number(asset.oneDayPrice || 0),
      0,
    ),
  );
  const investedValue = roundMoney(
    portfolioGroupDoc?.groupSnapshot?.investmentValue ||
      financialAssets.reduce(
        (total, asset) => total + Number(asset.invested || 0),
        0,
      ),
  );
  const currentValue = roundMoney(
    portfolioGroupDoc?.groupSnapshot?.currentValue ||
      financialAssets.reduce(
        (total, asset) => total + Number(asset.current || 0),
        0,
      ),
  );
  const previousValue = currentValue - todaysGainPrice;
  const todayPercent =
    previousValue > 0 ? (todaysGainPrice / previousValue) * 100 : 0;
  const groupXirr = portfolioGroupDoc?.groupSnapshot?.groupXirr || {};

  return {
    investedValue,
    currentValue,
    todaysGain: {
      price: todaysGainPrice,
      today: formatPercent(todayPercent),
    },
    groupXirr: {
      xirr: formatPercent(groupXirr.xirr),
      lastcomputed: formatDate(groupXirr.lastcomputed),
    },
  };
};

const buildBucketCost = ({ financialAssets }) => {
  const currentValue = roundMoney(
    financialAssets.reduce(
      (total, asset) => total + Number(asset.current || 0),
      0,
    ),
  );
  const anualCost = roundMoney(
    financialAssets.reduce((total, asset) => {
      const assetCurrentValue = Number(asset.current || 0);
      const expenseRatio = Number(asset.expenseRatioValue || 0);
      return total + (assetCurrentValue * expenseRatio) / 100;
    }, 0),
  );

  const totalExpenseRatio =
    currentValue > 0 ? (anualCost / currentValue) * 100 : 0;

  return {
    totalExpenseRatio: formatPercent(totalExpenseRatio),
    anualCost,
  };
};

const read_User_Holdings_ByGroupIds = async ({
  userId = null,
  groupIds = [],
  status = true,
  session = null,
}) => {
  try {
    const FINANCIALASSET_MODEL = mongoose.model("financialAsset");

    if (!userId || !Array.isArray(groupIds) || groupIds.length === 0) {
      throw new customError("userId and groupIds are required", 400);
    }

    const userObjectId = toObjectId(userId, "userId");
    const groupObjectIds = [
      ...new Set(groupIds.map((groupId) => groupId.toString())),
    ].map((groupId) => toObjectId(groupId, "groupId"));

    const filter = {
      userId: userObjectId,
      portfolioGroupId: { $in: groupObjectIds },
    };

    if (status !== null) {
      filter.status = status;
    }

    const query = FINANCIALASSET_MODEL.find(filter).lean();

    if (session !== null) {
      query.session(session);
    }

    const financialAssets = await query;

    return await addLtpToFinancialAssets({ financialAssets, session });
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Internal Server Error", 500);
  }
};

module.exports.read_User_Holdings = async ({ filterObj = null }) => {
  try {
    const PORTFOLIOGROUP_MODEL = mongoose.model("portfolioGroup");
    const {
      portfolioGroupId = null,
      userId = null,
      status = true,
    } = filterObj || {};

    if (!filterObj || !portfolioGroupId || !userId) {
      throw new customError("Missing Request Credentials", 400);
    }

    const [leafGroupIds, portfolioGroupDoc] = await Promise.all([
      get_leafGroupIDsByGroup(portfolioGroupId, userId),
      PORTFOLIOGROUP_MODEL.findOne({
        _id: portfolioGroupId,
        userId,
      }),
    ]);

    if (!portfolioGroupDoc) {
      throw new customError("Unauthorized", 401);
    }

    const financialAssets = leafGroupIds.length
      ? await read_User_Holdings_ByGroupIds({
          userId,
          groupIds: leafGroupIds,
          status,
        })
      : [];

    // const userHoldings = financialAssets.map(
    //   ({ expenseRatioValue, ...financialAsset }) => financialAsset,
    // );

    const respObj = {
      totalStats: buildHoldingsStats({
        financialAssets,
        portfolioGroupDoc,
      }),
      buketCost: buildBucketCost({ financialAssets }),
      userHoldings: financialAssets,
    };

    return respObj;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Internal Server Error", 500);
  }
};

module.exports.read_User_Holdings_ByGroupIds = read_User_Holdings_ByGroupIds;
