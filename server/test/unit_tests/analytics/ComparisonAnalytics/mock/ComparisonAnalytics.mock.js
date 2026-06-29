const mockIds = {
  userId: "64f100000000000000000001",
  groupId: "64f100000000000000000002",
  leafGroupId1: "64f100000000000000000003",
  leafGroupId2: "64f100000000000000000004",
  indexId: "64f100000000000000000005",
};

const mockSession = {
  id: "mock-session-id",
};

const mockStartDate = "2023-06-29T00:00:00.000Z";
const fixedToday = "2026-06-29T11:30:00.000Z";
const fixedTodayMidnight = new Date("2026-06-29T00:00:00.000Z");

const latestDate = "2026-06-29T00:00:00.000Z";

const dateKeyFromOffset = (offset) => {
  const date = new Date(latestDate);
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
};

const indexPriceKeyFromDateKey = (dateKey) => `${dateKey}T10:00:00.000Z`;

const createNavSeries = ({ days, navOverrides = {}, units = 10 }) => {
  const series = {};

  for (let offset = 0; offset < days; offset += 1) {
    series[dateKeyFromOffset(offset)] = {
      nav: navOverrides[offset] ?? 100,
      units,
    };
  }

  return series;
};

const createIndexSeries = ({ days, priceOverrides = {} }) => {
  const series = {};

  for (let offset = 0; offset < days; offset += 1) {
    series[indexPriceKeyFromDateKey(dateKeyFromOffset(offset))] =
      priceOverrides[offset] ?? 100;
  }

  return series;
};

const fullNavSeries = createNavSeries({
  days: 1095,
  navOverrides: {
    0: 200,
    89: 100,
    364: 80,
    1094: 50,
  },
});

const fullIndexSeries = createIndexSeries({
  days: 1095,
  priceOverrides: {
    0: 100,
    89: 50,
    364: 40,
    1094: 25,
  },
});

const partialNavSeries = createNavSeries({
  days: 45,
  navOverrides: {
    0: 120,
    44: 100,
  },
});

const partialIndexSeries = createIndexSeries({
  days: 45,
  priceOverrides: {
    0: 100,
    44: 80,
  },
});

const singlePointNavSeries = createNavSeries({
  days: 1,
  navOverrides: {
    0: 120,
  },
});

const singlePointIndexSeries = createIndexSeries({
  days: 1,
  priceOverrides: {
    0: 100,
  },
});

const createCashflowsWithoutToday = () => [
  {
    date: new Date("2025-01-01T00:00:00.000Z"),
    amount: -10000,
  },
  {
    date: new Date("2026-01-01T00:00:00.000Z"),
    amount: -5000,
  },
];

const createCashflowsWithToday = () => [
  {
    date: new Date("2025-01-01T00:00:00.000Z"),
    amount: -10000,
  },
  {
    date: new Date("2026-06-29T00:00:00.000Z"),
    amount: -5000,
  },
];

const indexPricesForXirr = {
  "2025-01-01T10:00:00.000Z": 100,
  "2026-01-01T10:00:00.000Z": 125,
  "2026-06-29T10:00:00.000Z": 150,
};

module.exports = {
  mockIds,
  mockSession,
  mockStartDate,
  fixedToday,
  fixedTodayMidnight,
  fullNavSeries,
  fullIndexSeries,
  partialNavSeries,
  partialIndexSeries,
  singlePointNavSeries,
  singlePointIndexSeries,
  createCashflowsWithoutToday,
  createCashflowsWithToday,
  indexPricesForXirr,
  dateKeyFromOffset,
  indexPriceKeyFromDateKey,
};
