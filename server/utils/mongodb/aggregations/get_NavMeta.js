const mongoose = require("mongoose");

module.exports.get_NavMeta = async (
  userId,
  startDate = null,
  session = null,
) => {
  const PortfolioGroup_Model = mongoose.model("portfolioGroup");

  const navDateFilter = startDate
    ? {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$portfolioGroupId", "$$groupId"] },
              { $eq: ["$userId", "$$uId"] },
              { $lte: ["$date", startDate] },
            ],
          },
        },
      }
    : {
        $match: {
          $expr: {
            $and: [
              { $eq: ["$portfolioGroupId", "$$groupId"] },
              { $eq: ["$userId", "$$uId"] },
            ],
          },
        },
      };

  const result = await PortfolioGroup_Model.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $lookup: {
        from: "portfoliogroups",
        localField: "_id",
        foreignField: "parentId",
        as: "children",
      },
    },

    {
      $addFields: {
        isLeaf: { $eq: [{ $size: "$children" }, 0] },
      },
    },

    {
      $lookup: {
        from: "navperformences",
        let: { groupId: "$_id", uId: "$userId" },
        pipeline: [
          navDateFilter,
          { $sort: { date: -1 } },
          { $limit: 1 },
          {
            $project: {
              _id: 0,
              nav: 1,
              units: 1,
              lastDate: "$date",
            },
          },
        ],
        as: "navData",
      },
    },

    {
      $addFields: {
        navData: {
          $ifNull: [{ $arrayElemAt: ["$navData", 0] }, null],
        },
      },
    },

    {
      $group: {
        _id: null,

        nullDate: {
          $push: {
            $cond: [{ $eq: ["$navData", null] }, "$_id", "$$REMOVE"],
          },
        },

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

        leafGroup: {
          $push: {
            $cond: [
              {
                $and: [{ $eq: ["$isLeaf", true] }, { $ne: ["$navData", null] }],
              },
              "$_id",
              "$$REMOVE",
            ],
          },
        },

        lastDate: { $max: "$navData.lastDate" },
      },
    },

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
        leafGroup: 1,
        lastDate: 1,
      },
    },
  ]).session(session);

  return result[0] || {};
};
