const mongoose = require("mongoose");

module.exports.getLatestCloses = async (targetDate = null) => {
  const date = targetDate ? new Date(targetDate) : null;

  const pipeline = [
    {
      $facet: {
        // 🔴 Latest CMP
        latest: [
          { $sort: { assetId: 1, date: -1 } },
          {
            $group: {
              _id: "$assetId",
              cmp: { $first: "$close" },
            },
          },
        ],

        // 🔴 Future (>= targetDate)
        future: date
          ? [
              { $match: { date: { $gte: date } } },
              { $sort: { assetId: 1, date: 1 } },
              {
                $group: {
                  _id: "$assetId",
                  datedCmp: { $first: "$close" },
                },
              },
            ]
          : [],

        // 🔴 Past (<= targetDate)
        past: date
          ? [
              { $match: { date: { $lte: date } } },
              { $sort: { assetId: 1, date: -1 } },
              {
                $group: {
                  _id: "$assetId",
                  datedCmp: { $first: "$close" },
                },
              },
            ]
          : [],
      },
    },
  ];

  const data = await mongoose
    .model("AssetPriceHistory")
    .aggregate(pipeline);

  const result = {};

  const latestMap = {};
  const futureMap = {};
  const pastMap = {};

  const latestData = data[0].latest || [];
  const futureData = data[0].future || [];
  const pastData = data[0].past || [];

  // 🔴 Latest
  for (const item of latestData) {
    latestMap[item._id.toString()] = item.cmp;
  }

  // 🔴 Future
  for (const item of futureData) {
    futureMap[item._id.toString()] = item.datedCmp;
  }

  // 🔴 Past
  for (const item of pastData) {
    pastMap[item._id.toString()] = item.datedCmp;
  }

  const allIds = new Set([
    ...Object.keys(latestMap),
    ...Object.keys(futureMap),
    ...Object.keys(pastMap),
  ]);

  for (const id of allIds) {
    result[id] = {
      cmp: latestMap[id] ?? null,
      datedCmp: date
        ? futureMap[id] !== undefined
          ? futureMap[id]
          : pastMap[id] !== undefined
          ? pastMap[id]
          : null
        : null,
    };
  }

  return result;
};