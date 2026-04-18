const mongoose = require("mongoose");
const {
  normalizeToIST330PM,
} = require("../../shared_Utils/helpers/getCurrentFinacialyear");
const { date } = require("joi");

module.exports.getLatestCloses = async (targetDate = null, session = null) => {
  const date = targetDate
    ? normalizeToIST330PM(new Date(targetDate))
    : normalizeToIST330PM(new Date());

  const pipeline = [
    {
      $facet: {
        // ! Latest CMP
        latest: [
          { $sort: { assetId: 1, date: -1 } },
          {
            $group: {
              _id: "$assetId",
              cmp: { $first: "$close" },
            },
          },
        ],

        // ! Closest date >= targetDate
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
      },
    },
  ];

  const data = await mongoose
    .model("AssetPriceHistory")
    .aggregate(pipeline)
    .session(session);

  const latestMap = {};
  const futureMap = {};

  const latestData = data[0]?.latest || [];
  const futureData = data[0]?.future || [];

  for (const item of latestData) {
    latestMap[item._id.toString()] = item.cmp;
  }

  for (const item of futureData) {
    futureMap[item._id.toString()] = item.datedCmp;
  }

  const allIds = new Set([
    ...Object.keys(latestMap),
    ...Object.keys(futureMap),
  ]);
  const result = {};
  for (const id of allIds) {
    result[id] = {
      cmp: latestMap[id] ?? null,
      datedCmp: futureMap[id] ?? null,
    };
  }
  return result;
};

module.exports.getPastClosePrices = async (
  startDate,
  endDate,
  session = null,
) => {
  const AssetPriceHistory = mongoose.model("AssetPriceHistory");

  startDate = normalizeToIST330PM(startDate);
  endDate = normalizeToIST330PM(endDate);

  //!  Needed to seed previous prices before start date
  const seedData = await AssetPriceHistory.aggregate([
    {
      $match: {
        date: { $lt: startDate },
      },
    },
    {
      $sort: { date: -1 },
    },
    {
      $group: {
        _id: "$assetId",
        close: { $first: "$close" },
      },
    },
  ]).session(session);

  const rangeData = await AssetPriceHistory.find({
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: 1, assetId: 1 })
    .session(session)
    .lean();

  // ! latest known prices
  const latestPrice = {};

  for (const row of seedData) {
    latestPrice[row._id.toString()] = row.close;
  }

  // ! group actual rows by date
  const byDate = {};

  for (const row of rangeData) {
    const dateKey = row.date.toISOString();
    const assetId = row.assetId.toString();

    if (!byDate[dateKey]) byDate[dateKey] = [];
    byDate[dateKey].push(row);
  }

  const result = {};

  let current = new Date(startDate);

  while (current <= endDate) {
    const dateKey = current.toISOString();

    // ! update latest known prices if rows exist today
    if (byDate[dateKey]) {
      for (const row of byDate[dateKey]) {
        latestPrice[row.assetId.toString()] = row.close;
      }
    }

    // ! snapshot today's prices
    result[dateKey] = { ...latestPrice };

    current.setDate(current.getDate() + 1);
    current = normalizeToIST330PM(current);
  }
  return result;
};
