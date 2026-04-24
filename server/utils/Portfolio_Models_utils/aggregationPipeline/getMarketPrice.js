const mongoose = require("mongoose");
const {
  normalizeToIST330PM,
  normalizeToIST5PM,
  normalizeToISTEndOfDay,
} = require("../../shared_Utils/helpers/getCurrentFinacialyear");
const { date } = require("joi");
const { json } = require("express");

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

module.exports.getDailyClosePricesByFinancialAsset = async (
  financialAsset = null,
  startDate = null,
  nav = false,
  session = null,
  endDate = null,
) => {
  const AssetPriceHistory_Model = mongoose.model("AssetPriceHistory");
  const NAV_Model = mongoose.model("navPerformence");
  const reqested_Model = nav ? NAV_Model : AssetPriceHistory_Model;

  if (!startDate) {
    throw new Error("Start Date Requiered");
  }
  if (!financialAsset) {
    throw new Error("Financial Asset Requiered");
  }
  startDate = nav
    ? normalizeToIST5PM(startDate)
    : normalizeToIST330PM(startDate);

  endDate = nav
    ? endDate
      ? normalizeToIST5PM(endDate)
      : normalizeToIST5PM(new Date())
    : endDate
      ? normalizeToIST330PM(endDate)
      : normalizeToIST330PM(new Date());

  const assetId = nav ? "portfolioGroupId" : "assetId";

  const [seedData, rangeData] = await Promise.all([
    reqested_Model
      .findOne({
        [assetId]: financialAsset,
        date: { $lt: startDate },
      })
      .sort({ date: -1 })
      .session(session)
      .lean(),
    reqested_Model
      .find({
        [assetId]: financialAsset,
        date: { $gte: startDate, $lte: endDate },
      })
      .sort({ date: 1 })
      .session(session)
      .lean(),
  ]);
  let result = {};

  if (seedData && seedData.close) {
    result[startDate.toISOString()] = seedData.close;
  }

  for (const data of rangeData) {
    nav
      ? (result[data.date.toISOString()] = { nav: data.nav, units: data.units })
      : (result[data.date.toISOString()] = data.close);
  }

  let current = new Date(startDate);

  while (current <= endDate) {
    const dateKey = current.toISOString();
    let previousDayDate = new Date(current);
    previousDayDate.setDate(previousDayDate.getDate() - 1);
    if (!result[dateKey]) {
      nav
        ? (result[dateKey] = {
            nav: result[previousDayDate.toISOString()].nav,
            units: result[previousDayDate.toISOString()].units,
          })
        : (result[dateKey] = result[previousDayDate.toISOString()]);
    }
    current.setDate(current.getDate() + 1);
  }
  return result;
};
