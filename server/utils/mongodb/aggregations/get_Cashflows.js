const mongoose = require("mongoose");

module.exports.build_GroupCashflows = async (
  userId,
  groupIds,
  session = null,
) => {
  const GroupStatement = mongoose.model("groupStatement");

  if (!userId || !Array.isArray(groupIds) || groupIds.length === 0) {
    throw new Error("userId and groupIds are required");
  }
  const userObjectId = new mongoose.Types.ObjectId(userId);
  const groupObjectIds = groupIds.map((id) => new mongoose.Types.ObjectId(id));

  const matchStage = {
    userId: userObjectId,
    portfolioGroupId: { $in: groupObjectIds },
    type: { $ne: "tax" },
  };

  if (session !== null) {
    matchStage.session = session;
  }

  const result = await GroupStatement.aggregate([
    { $match: matchStage },
    {
      $project: {
        date: {
          $dateTrunc: {
            date: "$date",
            unit: "day",
            timezone: "UTC",
          },
        },

        amount: {
          $cond: [
            { $eq: ["$type", "deposit"] },
            { $multiply: ["$amount", -1] },
            "$amount",
          ],
        },
      },
    },
    {
      $group: {
        _id: "$date",
        amount: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        date: { $toDate: "$_id" },
        amount: 1,
      },
    },
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  return result;
};
