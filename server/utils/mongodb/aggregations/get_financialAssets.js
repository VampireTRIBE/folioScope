// ! Third Party Packages
const mongoose = require("mongoose");

// ! utils
const customError = require("../../shared/error/customError");

module.exports.get_AllFinancialAsset = async (userId, session = null) => {
  const FinancialAsset = mongoose.model("financialAsset");
  const assets = await FinancialAsset.find(
    { userId: new mongoose.Types.ObjectId(userId), status: true },
    { _id: 1, assetMetadataId: 1 },
  )
    .lean()
    .session(session);
  const result = {};
  for (const asset of assets) {
    result[asset._id] = asset.assetMetadataId;
  }
  return result;
};


module.exports.get_AllFinancialAssetWithCurrentValue = async (
  userId=null,
  session = null,
) => {
  try {
    if (!userId) {
      throw new customError("Missing userId", 400);
    }

    const FinancialAsset = mongoose.model("financialAsset");

    const assets = await FinancialAsset.find(
      {
        userId: new mongoose.Types.ObjectId(userId),
        status: true,
      },
      {
        _id: 1,
        assetMetadataId: 1,
        portfolioGroupId: 1,
        snapshot: 1,
      },
    )
      .lean()
      .session(session);

    const result = {};

    for (const asset of assets) {
      const groupId = asset.portfolioGroupId?.toString();
      const assetMetadataId = asset.assetMetadataId?.toString();

      if (!groupId || !assetMetadataId) continue;

      if (!result[groupId]) {
        result[groupId] = {};
      }

      result[groupId][assetMetadataId] = {
        _id: asset._id,
        investedValue: Number(asset.snapshot?.investmentValue || 0),
        currentValue: Number(asset.snapshot?.currentValue || 0),
      };
    }
    return result;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Internal Server Error", 500);
  }
};
