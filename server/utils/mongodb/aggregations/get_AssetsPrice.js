const mongoose = require("mongoose");

const {
  normalizeToIST330PM,
  normalizeToIST5PM,
  normalizeToISTEndOfDay,
} = require("../../transformData/normalizeDates");
const customError = require("../../shared/error/customError");

module.exports.get_LatestTargetCloses = async (
  targetDate = null,
  session = null,
) => {
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

module.exports.get_PeriodCloses = async (
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

module.exports.get_DailyClosePricesByAsset = async (
  asset = null,
  startDate = null,
  nav = false,
  userId = null,
  session = null,
  endDate = null,
) => {
  const AssetPriceHistory_Model = mongoose.model("AssetPriceHistory");
  const NAV_Model = mongoose.model("navPerformence");
  const reqested_Model = nav ? NAV_Model : AssetPriceHistory_Model;

  if (!startDate) {
    throw new customError("Start Date Requiered", 400);
  }
  if (!asset) {
    throw new customError("Financial Asset Requiered", 400);
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

  let query1 = {
    [assetId]: asset,
    date: { $lt: startDate },
  };
  let query2 = {
    [assetId]: asset,
    date: { $gte: startDate, $lte: endDate },
  };

  if (nav) {
    query1.userId = userId;
    query2.userId = userId;
  }

  const [seedData, rangeData] = await Promise.all([
    reqested_Model.findOne(query1).sort({ date: -1 }).session(session).lean(),
    reqested_Model.find(query2).sort({ date: 1 }).session(session).lean(),
  ]);
  let result = {};

  if (!nav && seedData && seedData.close) {
    result[startDate.toISOString()] = seedData.close;
  }

  if (nav && seedData && seedData.nav) {
    result[startDate.toISOString()] = {
      nav: seedData.nav,
      units: seedData.units,
    };
  }

  let current = null;
  if (seedData) {
    current = new Date(startDate);
  } else if (rangeData.length > 0) {
    current = new Date(rangeData[0].date);
  } else {
    return result;
  }

  for (const data of rangeData) {
    nav
      ? (result[data.date.toISOString()] = { nav: data.nav, units: data.units })
      : (result[data.date.toISOString()] = data.close);
  }

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

module.exports.get_RawPastPricesbyAssetID = async (assetId, count = 252) => {
  const AssetPriceHistory_Model = mongoose.model("AssetPriceHistory");
  const prices = await AssetPriceHistory_Model.find({
    assetId,
  })
    .sort({ date: -1 })
    .limit(count)
    .select("close -_id")
    .lean();

  let resultObj = {
    [assetId]: [],
  };
  for (let index = prices.length - 1; index >= 0; index--) {
    resultObj[assetId].push(prices[index].close);
  }
  return resultObj;
};

module.exports.get_52WStatsByAssetId = async (assetId, count = 252) => {
  const AssetPriceHistory_Model = mongoose.model("AssetPriceHistory");

  const prices = await AssetPriceHistory_Model.find({
    assetId,
  })
    .sort({ date: -1 })
    .limit(count)
    .select("close -_id")
    .lean();

  if (!prices.length) {
    return {
      [assetId]: {
        distanceFrom52WHighPercent: null,
        distanceFrom52WLowPercent: null,
        currentPrice: null,
        todayChangePercent: null,
        high52W: null,
        low52W: null,
      },
    };
  }

  // reverse because DB data is newest -> oldest
  const closePrices = prices.reverse().map((item) => item.close);

  const high52W = Math.max(...closePrices);
  const low52W = Math.min(...closePrices);
  const currentPrice = closePrices[closePrices.length - 1];

  const previousPrice =
    closePrices.length > 1 ? closePrices[closePrices.length - 2] : currentPrice;

  const todayChangePercent = Number(
    ((currentPrice - previousPrice) / previousPrice) * 100,
  );
  const distanceFrom52WHighPercent = Number(
    ((high52W - currentPrice) / high52W) * 100,
  );
  const distanceFrom52WLowPercent = Number(
    ((currentPrice - low52W) / low52W) * 100,
  );

  return {
    [assetId]: {
      high52W: high52W.toFixed(2),
      low52W: low52W.toFixed(2),
      currentPrice: currentPrice.toFixed(2),
      todayChangePercent: todayChangePercent.toFixed(2),
      distanceFrom52WHighPercent: distanceFrom52WHighPercent.toFixed(2),
      distanceFrom52WLowPercent: distanceFrom52WLowPercent.toFixed(2),
    },
  };
};
