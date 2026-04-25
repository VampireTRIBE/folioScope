const mongoose = require("mongoose");

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
