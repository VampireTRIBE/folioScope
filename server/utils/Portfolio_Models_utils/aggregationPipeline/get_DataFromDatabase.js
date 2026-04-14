const mongoose = require("mongoose");

module.exports.get_NavMeta = async (userId, session = null) => {
  const PortfolioGroup_Model = mongoose.model("portfolioGroup");

  const result = await PortfolioGroup_Model.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "navperformences",
        let: { groupId: "$_id", uId: "$userId" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$portfolioGroupId", "$$groupId"] },
                  { $eq: ["$userId", "$$uId"] },
                ],
              },
            },
          },
          { $sort: { date: -1 } },
          { $limit: 1 },
          {
            $project: {
              _id: 0,
              nav: "$nav",
              units: "$units",
              lastDate: "$date",
            },
          },
        ],
        as: "navData",
      },
    },

    // -------- FLATTEN LOOKUP RESULT --------
    {
      $addFields: {
        navData: {
          $ifNull: [{ $arrayElemAt: ["$navData", 0] }, null],
        },
      },
    },

    // -------- GROUP INTO FINAL STRUCTURE --------
    {
      $group: {
        _id: null,
        nullDate: {
          $push: {
            $cond: [{ $eq: ["$navData", null] }, "$_id", "$$REMOVE"],
          },
        },

        // groups WITH NAV → map { id: { nav, units } }
        nonNullDateArr: {
          $push: {
            $cond: [
              { $ne: ["$navData", null] },
              {
                k: { $toString: "$_id" },
                v: {
                  nav: "$navData.nav",
                  units: "$navData.units",
                },
              },
              "$$REMOVE",
            ],
          },
        },

        // global latest date
        lastDate: { $max: "$navData.lastDate" },
      },
    },

    // -------- CONVERT ARRAY → OBJECT --------
    {
      $addFields: {
        nonNullDate: { $arrayToObject: "$nonNullDateArr" },
      },
    },

    {
      $project: {
        _id: 0,
        nullDate: 1,
        nonNullDate: 1,
        lastDate: 1,
      },
    },
  ]).session(session);

  return (
    result[0] || []
  );
};
