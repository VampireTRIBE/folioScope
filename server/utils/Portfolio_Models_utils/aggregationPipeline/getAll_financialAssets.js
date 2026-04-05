const mongoose = require("mongoose");

module.exports.getFinancialAsset = async (userId) => {
  const FinancialAsset = mongoose.model("financialAsset");
  const assets = await FinancialAsset.find(
    { userId: new mongoose.Types.ObjectId(userId), status: true },
    { _id: 1, assetMetadataId: 1 },
  ).lean();
  const result = {};
  for (const asset of assets) {
    result[asset._id] = asset.assetMetadataId;
  }
  return result;
};
