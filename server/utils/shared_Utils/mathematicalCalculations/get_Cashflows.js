const mongoose = require("mongoose");

module.exports.buildCashflows = async (userId, groupIds, session = null) => {
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

    // normalize + sign adjustment
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

    // MERGE SAME DAY
    {
      $group: {
        _id: "$date",
        amount: { $sum: "$amount" },
      },
    },

    // reshape output
    {
      $project: {
        _id: 0,
        date: { $toDate: "$_id" },
        amount: 1,
      },
    },

    // sort final output
    {
      $sort: {
        date: 1,
      },
    },
  ]);

  return result;
};
