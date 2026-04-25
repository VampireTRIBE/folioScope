const mongoose = require("mongoose");
module.exports.get_GroupAssetQtyMap = async (userId, session = null) => {
  const FinancialAsset = mongoose.model("financialAsset");

  const rows = await FinancialAsset.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: true,
      },
    },
    {
      $project: {
        groupId: { $toString: "$portfolioGroupId" },
        assetId: { $toString: "$assetMetadataId" },
        totalQty: "$snapshot.totalQty",
      },
    },
    {
      $group: {
        _id: {
          groupId: "$groupId",
          assetId: "$assetId",
        },
        totalQty: { $sum: "$totalQty" },
      },
    },
    {
      $group: {
        _id: "$_id.groupId",
        assets: {
          $push: {
            k: "$_id.assetId",
            v: "$totalQty",
          },
        },
      },
    },
    {
      $project: {
        _id: 0,
        groupId: "$_id",
        assets: { $arrayToObject: "$assets" },
      },
    },
  ]).session(session);

  const result = {};

  for (const row of rows) {
    result[row.groupId] = row.assets;
  }
  return result;
};
