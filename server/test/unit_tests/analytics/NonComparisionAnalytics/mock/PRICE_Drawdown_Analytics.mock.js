const mockIds = {
  userId: "64f000000000000000000001",
  assetName: "NIFTY 50",
  navGroupId: "64f000000000000000000003",
};

const mockSession = {
  id: "mock-session-id",
};

const mockStartDate = "2023-06-29T00:00:00.000Z";

const latestDate = "2026-06-29T00:00:00.000Z";

const dateKeyFromOffset = (offset) => {
  const date = new Date(latestDate);
  date.setUTCDate(date.getUTCDate() - offset);
  return date.toISOString().slice(0, 10);
};

const createPriceSeries = ({ days, overrides = {} }) => {
  const series = {};

  for (let offset = 0; offset < days; offset += 1) {
    series[dateKeyFromOffset(offset)] = overrides[offset] ?? 100;
  }

  return series;
};

const createNavSeries = ({ days, overrides = {} }) => {
  const series = {};

  for (let offset = 0; offset < days; offset += 1) {
    series[dateKeyFromOffset(offset)] = {
      nav: overrides[offset] ?? 100,
    };
  }

  return series;
};

const fullPriceSeries = createPriceSeries({
  days: 1095,
  overrides: {
    0: 160,
    89: 100,
    364: 80,
    1094: 40,
  },
});

const partialPriceSeries = createPriceSeries({
  days: 45,
  overrides: {
    0: 110,
    44: 100,
  },
});

const singlePointPriceSeries = createPriceSeries({
  days: 1,
  overrides: {
    0: 110,
  },
});

const navPriceSeries = createNavSeries({
  days: 90,
  overrides: {
    0: 150,
    89: 100,
  },
});

module.exports = {
  mockIds,
  mockSession,
  mockStartDate,
  fullPriceSeries,
  partialPriceSeries,
  singlePointPriceSeries,
  navPriceSeries,
  dateKeyFromOffset,
};
