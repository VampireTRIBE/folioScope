const mongoose = require("mongoose");
const {
  normalizeToIST330PM,
} = require("../../shared_Utils/helpers/getCurrentFinacialyear");

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

  const data = await mongoose.model("AssetPriceHistory").aggregate(pipeline);

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

module.exports.getPastCloses = async (targetDate, cfyear, session = null) => {
  const target = normalizeToIST330PM(targetDate);
  const fyDate = new Date(cfyear);

  const AssetPriceHistory = mongoose.model("AssetPriceHistory");

  // 🔴 Baseline at cfyear (nearest ≤)
  const fyAgg = await AssetPriceHistory.aggregate(
    [
      { $match: { date: { $lte: fyDate } } },
      { $sort: { assetId: 1, date: -1 } },
      {
        $group: {
          _id: "$assetId",
          cmp: { $first: "$close" },
        },
      },
    ],
    { session },
  );

  const cmpMap = {};
  for (const item of fyAgg) {
    cmpMap[item._id.toString()] = item.cmp;
  }

  // 🔴 Future data
  const futureData = await AssetPriceHistory.find({
    date: { $gte: target },
  })
    .sort({ date: 1, assetId: 1 })
    .session(session)
    .lean();

  const grouped = {};

  for (const doc of futureData) {
    const d = doc.date.toISOString();
    const assetId = doc.assetId.toString();

    if (!grouped[d]) grouped[d] = {};

    grouped[d][assetId] = {
      cmp: doc.close,
      datedCmp: cmpMap[assetId] ?? null,
    };
  }

  return Object.entries(grouped).map(([date, assets]) => ({
    date,
    assets,
  }));
};

module.exports.getPastClosePrices = async (
  startDate,
  endDate,
  session = null,
) => {
  startDate = normalizeToIST330PM(startDate);
  endDate = normalizeToIST330PM(endDate);

  const AssetPriceHistory = mongoose.model("AssetPriceHistory");

  const data = await AssetPriceHistory.find({
    date: { $gte: startDate, $lte: endDate },
  })
    .sort({ date: 1, assetId: 1 })
    .session(session)
    .lean();

  const grouped = {};

  for (const doc of data) {
    const d = doc.date.toISOString();
    const assetId = doc.assetId.toString();

    if (!grouped[d]) grouped[d] = {};

    grouped[d][assetId] = {
      cmp: doc.close,
    };
  }

  return Object.entries(grouped).map(([date, assets]) => ({
    date,
    assets,
  }));
};
