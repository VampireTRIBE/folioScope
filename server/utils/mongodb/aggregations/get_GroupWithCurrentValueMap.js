const mongoose = require("mongoose");
module.exports.get_GroupWithCurrentValueMap = async (
  ids = [],
  userId,
  session = null,
) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  if (!ids.length) return {};

  const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));

  const rows = await PortfolioGroup.aggregate([
    {
      $match: {
        _id: { $in: objectIds },
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      },
    },
    {
      $project: {
        _id: 0,
        groupId: { $toString: "$_id" },
        value: {
          $add: [{ $ifNull: ["$consolidatedCash", 0] }],
        },
      },
    },
  ]).session(session);

  const result = {};

  for (const row of rows) {
    result[row.groupId] = row.value;
  }

  return result;
};