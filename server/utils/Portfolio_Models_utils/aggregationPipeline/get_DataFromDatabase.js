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

module.exports.get_LastNavDatesByUser = async (session = null) => {
  const NavPerformanceModel = mongoose.model("navPerformence");
  const data = await NavPerformanceModel.aggregate([
    {
      $sort: { userId: 1, date: -1 },
    },
    {
      $group: {
        _id: "$userId",
        lastNavDate: { $first: "$date" },
      },
    },
  ]).session(session);
  const result = {};
  for (const item of data) {
    result[item._id.toString()] = {
      lastNavDate: item.lastNavDate,
    };
  }
  return result;
};

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
