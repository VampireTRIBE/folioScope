// test/utils/mock/computeIRR.mock.js

const date = (isoDate) => new Date(isoDate);

const mockCashflows = {
  simpleTenPercentGain: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 1100,
    },
  ],

  simpleTenPercentLoss: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 900,
    },
  ],

  twoYearTenPercentCompounded: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2025-12-31T00:00:00.000Z"),
      amount: 1210,
    },
  ],

  highReturnInvestment: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 3000,
    },
  ],

  sipStyleCashflows: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -5000,
    },
    {
      date: date("2024-03-01T00:00:00.000Z"),
      amount: -2000,
    },
    {
      date: date("2024-06-01T00:00:00.000Z"),
      amount: -2000,
    },
    {
      date: date("2024-09-01T00:00:00.000Z"),
      amount: 1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 9500,
    },
  ],

  irregularCashflows: [
    {
      date: date("2024-01-15T00:00:00.000Z"),
      amount: -10000,
    },
    {
      date: date("2024-02-20T00:00:00.000Z"),
      amount: -3000,
    },
    {
      date: date("2024-05-10T00:00:00.000Z"),
      amount: 1500,
    },
    {
      date: date("2024-08-25T00:00:00.000Z"),
      amount: -2000,
    },
    {
      date: date("2025-01-15T00:00:00.000Z"),
      amount: 17000,
    },
  ],

  zeroAmountIncluded: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-06-01T00:00:00.000Z"),
      amount: 0,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 1100,
    },
  ],

  sameDayNetZero: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: 1000,
    },
  ],

  sameDayNetPositive: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: 1100,
    },
  ],

  onlyOneCashflow: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
  ],

  allPositive: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: 1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 1100,
    },
  ],

  allNegative: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: -1100,
    },
  ],

  allZero: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: 0,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 0,
    },
  ],

  missingAmount: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
    },
  ],

  stringAmount: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: "1100",
    },
  ],

  nanAmount: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-06-01T00:00:00.000Z"),
      amount: NaN,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 1100,
    },
  ],

  infinityAmount: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: Infinity,
    },
  ],

  invalidDateObject: [
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
    {
      date: new Date("invalid-date"),
      amount: 1100,
    },
  ],

  rawDateString: [
    {
      date: "2024-01-01T00:00:00.000Z",
      amount: -1000,
    },
    {
      date: "2024-12-31T00:00:00.000Z",
      amount: 1100,
    },
  ],

  unsortedCashflows: [
    {
      date: date("2024-12-31T00:00:00.000Z"),
      amount: 1100,
    },
    {
      date: date("2024-01-01T00:00:00.000Z"),
      amount: -1000,
    },
  ],

  googleSheetXirr1343: [
    {
      date: date("2026-06-29T00:00:00.000Z"),
      amount: 206106,
    },
    {
      date: date("2024-06-20T00:00:00.000Z"),
      amount: -148689.75,
    },
    {
      date: date("2025-01-20T00:00:00.000Z"),
      amount: -7433.25,
    },
    {
      date: date("2025-02-01T00:00:00.000Z"),
      amount: -2100,
    },
    {
      date: date("2025-02-11T00:00:00.000Z"),
      amount: 18000,
    },
    {
      date: date("2025-02-12T00:00:00.000Z"),
      amount: 27000,
    },
    {
      date: date("2025-02-24T00:00:00.000Z"),
      amount: -4740,
    },
    {
      date: date("2025-02-28T00:00:00.000Z"),
      amount: -5000,
    },
    {
      date: date("2025-03-02T00:00:00.000Z"),
      amount: -70650,
    },
    {
      date: date("2025-03-25T00:00:00.000Z"),
      amount: -3000,
    },
    {
      date: date("2025-04-07T00:00:00.000Z"),
      amount: -4500,
    },
    {
      date: date("2025-04-25T00:00:00.000Z"),
      amount: -3000,
    },
    {
      date: date("2025-06-13T00:00:00.000Z"),
      amount: -3000,
    },
    {
      date: date("2025-07-09T00:00:00.000Z"),
      amount: 11400,
    },
    {
      date: date("2025-08-08T00:00:00.000Z"),
      amount: -3500,
    },
    {
      date: date("2025-08-18T00:00:00.000Z"),
      amount: 2300,
    },
    {
      date: date("2025-08-19T00:00:00.000Z"),
      amount: 5000,
    },
    {
      date: date("2025-09-08T00:00:00.000Z"),
      amount: -2340,
    },
    {
      date: date("2025-09-26T00:00:00.000Z"),
      amount: -3300,
    },
    {
      date: date("2025-10-28T00:00:00.000Z"),
      amount: -6300,
    },
    {
      date: date("2026-01-22T00:00:00.000Z"),
      amount: 112800,
    },
    {
      date: date("2026-01-27T00:00:00.000Z"),
      amount: -71000,
    },
    {
      date: date("2026-02-01T00:00:00.000Z"),
      amount: -3000,
    },
    {
      date: date("2026-03-04T00:00:00.000Z"),
      amount: -35000,
    },
    {
      date: date("2026-03-11T00:00:00.000Z"),
      amount: -2500,
    },
    {
      date: date("2026-03-20T00:00:00.000Z"),
      amount: -9000,
    },
    {
      date: date("2026-04-24T00:00:00.000Z"),
      amount: 23600,
    },
    {
      date: date("2026-04-27T00:00:00.000Z"),
      amount: -1500,
    },
    {
      date: date("2026-05-11T00:00:00.000Z"),
      amount: 34400,
    },
  ],
};

module.exports = {
  mockCashflows,
};
