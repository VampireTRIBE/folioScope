// test/utils/mock/portfolioXirr.mock.js

const date = (isoDate) => new Date(isoDate);

const portfolioXirrMockData = {
  totalPortfolio: {
    totalInvestment: 848909.2,
    expectedXirr: 12.36737,
    cashflows: [
      {
        date: date("2026-06-29T00:00:00.000Z"),
        amount: 1139446,
      },
      {
        date: date("2022-04-27T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2022-05-09T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2022-05-13T00:00:00.000Z"),
        amount: -300,
      },
      {
        date: date("2022-05-16T00:00:00.000Z"),
        amount: -7000,
      },
      {
        date: date("2022-05-17T00:00:00.000Z"),
        amount: -1500,
      },
      {
        date: date("2022-05-23T00:00:00.000Z"),
        amount: -500,
      },
      {
        date: date("2022-07-19T00:00:00.000Z"),
        amount: 33210.62,
      },
      {
        date: date("2022-08-02T00:00:00.000Z"),
        amount: -33237,
      },
      {
        date: date("2022-08-19T00:00:00.000Z"),
        amount: 33250.51,
      },
      {
        date: date("2022-08-25T00:00:00.000Z"),
        amount: -7274,
      },
      {
        date: date("2022-08-26T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2022-09-09T00:00:00.000Z"),
        amount: -17200,
      },
      {
        date: date("2022-09-14T00:00:00.000Z"),
        amount: 17200,
      },
      {
        date: date("2022-09-16T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2022-09-28T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2022-10-06T00:00:00.000Z"),
        amount: 2191.82,
      },
      {
        date: date("2022-10-07T00:00:00.000Z"),
        amount: -2191,
      },
      {
        date: date("2022-10-09T00:00:00.000Z"),
        amount: -22191,
      },
      {
        date: date("2022-10-21T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2022-10-25T00:00:00.000Z"),
        amount: -4999.81,
      },
      {
        date: date("2022-11-25T00:00:00.000Z"),
        amount: -500.004,
      },
      {
        date: date("2022-12-19T00:00:00.000Z"),
        amount: -8500,
      },
      {
        date: date("2022-12-23T00:00:00.000Z"),
        amount: -549.909,
      },
      {
        date: date("2022-12-28T00:00:00.000Z"),
        amount: -12450,
      },
      {
        date: date("2023-01-05T00:00:00.000Z"),
        amount: -15200,
      },
      {
        date: date("2023-01-06T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2023-01-14T00:00:00.000Z"),
        amount: -8611,
      },
      {
        date: date("2023-01-25T00:00:00.000Z"),
        amount: -605.018,
      },
      {
        date: date("2023-02-22T00:00:00.000Z"),
        amount: -664.914,
      },
      {
        date: date("2023-02-23T00:00:00.000Z"),
        amount: -80000,
      },
      {
        date: date("2023-02-24T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2023-02-27T00:00:00.000Z"),
        amount: -1999.84,
      },
      {
        date: date("2023-03-28T00:00:00.000Z"),
        amount: -23699.95,
      },
      {
        date: date("2023-04-05T00:00:00.000Z"),
        amount: 24847.95,
      },
      {
        date: date("2023-04-07T00:00:00.000Z"),
        amount: -2448,
      },
      {
        date: date("2023-05-17T00:00:00.000Z"),
        amount: 130000,
      },
      {
        date: date("2023-07-07T00:00:00.000Z"),
        amount: 61802.7,
      },
      {
        date: date("2023-07-10T00:00:00.000Z"),
        amount: -182792.43,
      },
      {
        date: date("2023-07-12T00:00:00.000Z"),
        amount: -22434,
      },
      {
        date: date("2023-07-14T00:00:00.000Z"),
        amount: -19000,
      },
      {
        date: date("2023-07-23T00:00:00.000Z"),
        amount: -95051,
      },
      {
        date: date("2023-07-24T00:00:00.000Z"),
        amount: -95500,
      },
      {
        date: date("2023-08-02T00:00:00.000Z"),
        amount: -36100,
      },
      {
        date: date("2023-08-29T00:00:00.000Z"),
        amount: -150,
      },
      {
        date: date("2023-10-04T00:00:00.000Z"),
        amount: -30000,
      },
      {
        date: date("2023-10-06T00:00:00.000Z"),
        amount: 99.34,
      },
      {
        date: date("2023-10-09T00:00:00.000Z"),
        amount: -645,
      },
      {
        date: date("2023-10-26T00:00:00.000Z"),
        amount: -28000,
      },
      {
        date: date("2023-10-31T00:00:00.000Z"),
        amount: 32789.09,
      },
      {
        date: date("2023-11-01T00:00:00.000Z"),
        amount: 57210,
      },
      {
        date: date("2023-11-06T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2023-11-13T00:00:00.000Z"),
        amount: 40000,
      },
      {
        date: date("2023-12-13T00:00:00.000Z"),
        amount: -221,
      },
      {
        date: date("2023-12-26T00:00:00.000Z"),
        amount: 803.38,
      },
      {
        date: date("2023-12-27T00:00:00.000Z"),
        amount: 99901.77,
      },
      {
        date: date("2023-12-28T00:00:00.000Z"),
        amount: -9902,
      },
      {
        date: date("2024-01-01T00:00:00.000Z"),
        amount: -1399.927,
      },
      {
        date: date("2024-01-02T00:00:00.000Z"),
        amount: 1400,
      },
      {
        date: date("2024-01-05T00:00:00.000Z"),
        amount: 404.1,
      },
      {
        date: date("2024-01-06T00:00:00.000Z"),
        amount: -404,
      },
      {
        date: date("2024-01-15T00:00:00.000Z"),
        amount: 74502.2,
      },
      {
        date: date("2024-01-16T00:00:00.000Z"),
        amount: -79996.1,
      },
      {
        date: date("2024-01-18T00:00:00.000Z"),
        amount: -24498.8,
      },
      {
        date: date("2024-01-24T00:00:00.000Z"),
        amount: 30051,
      },
      {
        date: date("2024-02-02T00:00:00.000Z"),
        amount: -4998.86,
      },
      {
        date: date("2024-02-09T00:00:00.000Z"),
        amount: 105023.9,
      },
      {
        date: date("2024-02-12T00:00:00.000Z"),
        amount: -105621,
      },
      {
        date: date("2024-02-27T00:00:00.000Z"),
        amount: -15997.613,
      },
      {
        date: date("2024-04-02T00:00:00.000Z"),
        amount: 322.06,
      },
      {
        date: date("2024-04-22T00:00:00.000Z"),
        amount: -40322,
      },
      {
        date: date("2024-04-23T00:00:00.000Z"),
        amount: 19885.298,
      },
      {
        date: date("2024-04-24T00:00:00.000Z"),
        amount: -19997.7,
      },
      {
        date: date("2024-05-06T00:00:00.000Z"),
        amount: -20744.5,
      },
      {
        date: date("2024-05-30T00:00:00.000Z"),
        amount: -23181,
      },
      {
        date: date("2024-06-19T00:00:00.000Z"),
        amount: 544379.64,
      },
      {
        date: date("2024-06-20T00:00:00.000Z"),
        amount: -704506.6,
      },
      {
        date: date("2024-12-28T00:00:00.000Z"),
        amount: -50000,
      },
      {
        date: date("2025-01-20T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-02-01T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-02-06T00:00:00.000Z"),
        amount: -20000,
      },
      {
        date: date("2025-02-07T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-02-11T00:00:00.000Z"),
        amount: 18000,
      },
      {
        date: date("2025-02-12T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-02-15T00:00:00.000Z"),
        amount: -75000,
      },
      {
        date: date("2025-02-24T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-02-25T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-02-28T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-03-02T00:00:00.000Z"),
        amount: -25150,
      },
      {
        date: date("2025-03-03T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-03-13T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2025-03-14T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-03-18T00:00:00.000Z"),
        amount: 40083.04,
      },
      {
        date: date("2025-03-25T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-03-28T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-04-03T00:00:00.000Z"),
        amount: 3900,
      },
      {
        date: date("2025-04-07T00:00:00.000Z"),
        amount: -16400,
      },
      {
        date: date("2025-04-10T00:00:00.000Z"),
        amount: 301249,
      },
      {
        date: date("2025-04-11T00:00:00.000Z"),
        amount: -300000,
      },
      {
        date: date("2025-04-19T00:00:00.000Z"),
        amount: 21488,
      },
      {
        date: date("2025-04-22T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-04-23T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-04-24T00:00:00.000Z"),
        amount: -11500,
      },
      {
        date: date("2025-04-25T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-04-28T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-05-03T00:00:00.000Z"),
        amount: 23,
      },
      {
        date: date("2025-05-09T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-05-14T00:00:00.000Z"),
        amount: 82687.39,
      },
      {
        date: date("2025-05-19T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-05-22T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2025-05-30T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-06-03T00:00:00.000Z"),
        amount: 20255,
      },
      {
        date: date("2025-06-10T00:00:00.000Z"),
        amount: -2000,
      },
      {
        date: date("2025-06-11T00:00:00.000Z"),
        amount: 21066,
      },
      {
        date: date("2025-06-13T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-06-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-06-27T00:00:00.000Z"),
        amount: -8000,
      },
      {
        date: date("2025-07-09T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-07-17T00:00:00.000Z"),
        amount: 15060,
      },
      {
        date: date("2025-07-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-08-05T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-08-08T00:00:00.000Z"),
        amount: -18000,
      },
      {
        date: date("2025-08-18T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-08-19T00:00:00.000Z"),
        amount: 25875,
      },
      {
        date: date("2025-08-20T00:00:00.000Z"),
        amount: 20878,
      },
      {
        date: date("2025-09-03T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2025-09-04T00:00:00.000Z"),
        amount: -370,
      },
      {
        date: date("2025-09-08T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-09-18T00:00:00.000Z"),
        amount: 4,
      },
      {
        date: date("2025-09-26T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2025-09-27T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2025-10-14T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-10-28T00:00:00.000Z"),
        amount: -21000,
      },
      {
        date: date("2025-11-12T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-11-19T00:00:00.000Z"),
        amount: -2500,
      },
      {
        date: date("2025-12-04T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-12-08T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2025-12-15T00:00:00.000Z"),
        amount: -3000,
      },
      {
        date: date("2026-01-14T00:00:00.000Z"),
        amount: 2000,
      },
      {
        date: date("2026-01-22T00:00:00.000Z"),
        amount: 7000,
      },
      {
        date: date("2026-01-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-01-27T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-02-01T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2026-02-10T00:00:00.000Z"),
        amount: 20,
      },
      {
        date: date("2026-02-26T00:00:00.000Z"),
        amount: 9963,
      },
      {
        date: date("2026-03-04T00:00:00.000Z"),
        amount: 45,
      },
      {
        date: date("2026-03-10T00:00:00.000Z"),
        amount: 77,
      },
      {
        date: date("2026-03-11T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-03-20T00:00:00.000Z"),
        amount: -32000,
      },
      {
        date: date("2026-03-27T00:00:00.000Z"),
        amount: -20000,
      },
      {
        date: date("2026-03-30T00:00:00.000Z"),
        amount: -3000,
      },
      {
        date: date("2026-04-02T00:00:00.000Z"),
        amount: 20048,
      },
      {
        date: date("2026-04-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-04-27T00:00:00.000Z"),
        amount: -12000,
      },
      {
        date: date("2026-05-04T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2026-05-11T00:00:00.000Z"),
        amount: -1000,
      },
      {
        date: date("2026-05-12T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-06-05T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2026-06-15T00:00:00.000Z"),
        amount: 20000,
      },
      {
        date: date("2026-06-17T00:00:00.000Z"),
        amount: -16000,
      },
      {
        date: date("2026-06-18T00:00:00.000Z"),
        amount: 629,
      },
    ],
  },

  emergencyFunds: {
    totalInvestment: 109218.57,
    expectedXirr: 6.035191,
    cashflows: [
      {
        date: date("2026-06-29T00:00:00.000Z"),
        amount: 125933,
      },
      {
        date: date("2024-12-28T00:00:00.000Z"),
        amount: -50000,
      },
      {
        date: date("2025-02-01T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-02-06T00:00:00.000Z"),
        amount: -20000,
      },
      {
        date: date("2025-02-07T00:00:00.000Z"),
        amount: -5800,
      },
      {
        date: date("2025-02-15T00:00:00.000Z"),
        amount: -75000,
      },
      {
        date: date("2025-02-25T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-03-02T00:00:00.000Z"),
        amount: 50300,
      },
      {
        date: date("2025-03-03T00:00:00.000Z"),
        amount: 100197,
      },
      {
        date: date("2025-03-13T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2025-03-14T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-03-18T00:00:00.000Z"),
        amount: 40083.04,
      },
      {
        date: date("2025-03-25T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-03-28T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-04-03T00:00:00.000Z"),
        amount: -264800,
      },
      {
        date: date("2025-04-10T00:00:00.000Z"),
        amount: 301249,
      },
      {
        date: date("2025-04-11T00:00:00.000Z"),
        amount: -300000,
      },
      {
        date: date("2025-04-19T00:00:00.000Z"),
        amount: 21488,
      },
      {
        date: date("2025-04-22T00:00:00.000Z"),
        amount: -21500,
      },
      {
        date: date("2025-04-25T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-05-14T00:00:00.000Z"),
        amount: 20423.39,
      },
      {
        date: date("2025-05-19T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-05-30T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-06-03T00:00:00.000Z"),
        amount: 20255,
      },
      {
        date: date("2025-06-10T00:00:00.000Z"),
        amount: -2000,
      },
      {
        date: date("2025-06-11T00:00:00.000Z"),
        amount: 21066,
      },
      {
        date: date("2025-06-13T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-07-17T00:00:00.000Z"),
        amount: 15060,
      },
      {
        date: date("2025-08-08T00:00:00.000Z"),
        amount: -3000,
      },
      {
        date: date("2025-08-19T00:00:00.000Z"),
        amount: 20875,
      },
      {
        date: date("2025-08-20T00:00:00.000Z"),
        amount: 20878,
      },
      {
        date: date("2025-09-03T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2025-09-04T00:00:00.000Z"),
        amount: -370,
      },
      {
        date: date("2025-09-18T00:00:00.000Z"),
        amount: 16724,
      },
      {
        date: date("2025-09-27T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2025-10-14T00:00:00.000Z"),
        amount: -29500,
      },
      {
        date: date("2025-11-12T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-11-19T00:00:00.000Z"),
        amount: -2500,
      },
      {
        date: date("2025-12-04T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-12-08T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2025-12-15T00:00:00.000Z"),
        amount: -3000,
      },
      {
        date: date("2026-01-14T00:00:00.000Z"),
        amount: -35000,
      },
      {
        date: date("2026-01-22T00:00:00.000Z"),
        amount: -20000,
      },
      {
        date: date("2026-01-24T00:00:00.000Z"),
        amount: -2000,
      },
      {
        date: date("2026-01-27T00:00:00.000Z"),
        amount: -12000,
      },
      {
        date: date("2026-02-10T00:00:00.000Z"),
        amount: 20,
      },
      {
        date: date("2026-02-26T00:00:00.000Z"),
        amount: 9963,
      },
      {
        date: date("2026-03-04T00:00:00.000Z"),
        amount: 55045,
      },
      {
        date: date("2026-03-10T00:00:00.000Z"),
        amount: 257077,
      },
      {
        date: date("2026-03-20T00:00:00.000Z"),
        amount: -20000,
      },
      {
        date: date("2026-03-30T00:00:00.000Z"),
        amount: -3000,
      },
      {
        date: date("2026-04-02T00:00:00.000Z"),
        amount: 20048,
      },
      {
        date: date("2026-05-04T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2026-05-11T00:00:00.000Z"),
        amount: -1000,
      },
      {
        date: date("2026-06-15T00:00:00.000Z"),
        amount: 20000,
      },
      {
        date: date("2026-06-17T00:00:00.000Z"),
        amount: -12000,
      },
      {
        date: date("2026-06-18T00:00:00.000Z"),
        amount: -100500,
      },
    ],
  },

  investment: {
    totalInvestment: 741161,
    expectedXirr: 13.151225,
    cashflows: [
      {
        date: date("2026-06-29T00:00:00.000Z"),
        amount: 1013513.37,
      },
      {
        date: date("2022-04-27T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2022-05-09T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2022-05-13T00:00:00.000Z"),
        amount: -300,
      },
      {
        date: date("2022-05-16T00:00:00.000Z"),
        amount: -7000,
      },
      {
        date: date("2022-05-17T00:00:00.000Z"),
        amount: -1500,
      },
      {
        date: date("2022-05-23T00:00:00.000Z"),
        amount: -500,
      },
      {
        date: date("2022-07-19T00:00:00.000Z"),
        amount: 33210.62,
      },
      {
        date: date("2022-08-02T00:00:00.000Z"),
        amount: -33237,
      },
      {
        date: date("2022-08-19T00:00:00.000Z"),
        amount: 33250.51,
      },
      {
        date: date("2022-08-25T00:00:00.000Z"),
        amount: -7274,
      },
      {
        date: date("2022-08-26T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2022-09-09T00:00:00.000Z"),
        amount: -17200,
      },
      {
        date: date("2022-09-14T00:00:00.000Z"),
        amount: 17200,
      },
      {
        date: date("2022-09-16T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2022-09-28T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2022-10-06T00:00:00.000Z"),
        amount: 2191.82,
      },
      {
        date: date("2022-10-07T00:00:00.000Z"),
        amount: -2191,
      },
      {
        date: date("2022-10-09T00:00:00.000Z"),
        amount: -22191,
      },
      {
        date: date("2022-10-21T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2022-10-25T00:00:00.000Z"),
        amount: -4999.81,
      },
      {
        date: date("2022-11-25T00:00:00.000Z"),
        amount: -500.004,
      },
      {
        date: date("2022-12-19T00:00:00.000Z"),
        amount: -8500,
      },
      {
        date: date("2022-12-23T00:00:00.000Z"),
        amount: -549.909,
      },
      {
        date: date("2022-12-28T00:00:00.000Z"),
        amount: -12450,
      },
      {
        date: date("2023-01-05T00:00:00.000Z"),
        amount: -15200,
      },
      {
        date: date("2023-01-06T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2023-01-14T00:00:00.000Z"),
        amount: -8611,
      },
      {
        date: date("2023-01-25T00:00:00.000Z"),
        amount: -605.018,
      },
      {
        date: date("2023-02-22T00:00:00.000Z"),
        amount: -664.914,
      },
      {
        date: date("2023-02-23T00:00:00.000Z"),
        amount: -80000,
      },
      {
        date: date("2023-02-24T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2023-02-27T00:00:00.000Z"),
        amount: -1999.84,
      },
      {
        date: date("2023-03-28T00:00:00.000Z"),
        amount: -23699.95,
      },
      {
        date: date("2023-04-05T00:00:00.000Z"),
        amount: 24847.95,
      },
      {
        date: date("2023-04-07T00:00:00.000Z"),
        amount: -2448,
      },
      {
        date: date("2023-05-17T00:00:00.000Z"),
        amount: 130000,
      },
      {
        date: date("2023-07-07T00:00:00.000Z"),
        amount: 61802.7,
      },
      {
        date: date("2023-07-10T00:00:00.000Z"),
        amount: -182792.43,
      },
      {
        date: date("2023-07-12T00:00:00.000Z"),
        amount: -22434,
      },
      {
        date: date("2023-07-14T00:00:00.000Z"),
        amount: -19000,
      },
      {
        date: date("2023-07-23T00:00:00.000Z"),
        amount: -95051,
      },
      {
        date: date("2023-07-24T00:00:00.000Z"),
        amount: -95500,
      },
      {
        date: date("2023-08-02T00:00:00.000Z"),
        amount: -36100,
      },
      {
        date: date("2023-08-29T00:00:00.000Z"),
        amount: -150,
      },
      {
        date: date("2023-10-04T00:00:00.000Z"),
        amount: -30000,
      },
      {
        date: date("2023-10-06T00:00:00.000Z"),
        amount: 99.34,
      },
      {
        date: date("2023-10-09T00:00:00.000Z"),
        amount: -645,
      },
      {
        date: date("2023-10-26T00:00:00.000Z"),
        amount: -28000,
      },
      {
        date: date("2023-10-31T00:00:00.000Z"),
        amount: 32789.09,
      },
      {
        date: date("2023-11-01T00:00:00.000Z"),
        amount: 57210,
      },
      {
        date: date("2023-11-06T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2023-11-13T00:00:00.000Z"),
        amount: 40000,
      },
      {
        date: date("2023-12-13T00:00:00.000Z"),
        amount: -221,
      },
      {
        date: date("2023-12-26T00:00:00.000Z"),
        amount: 803.38,
      },
      {
        date: date("2023-12-27T00:00:00.000Z"),
        amount: 99901.77,
      },
      {
        date: date("2023-12-28T00:00:00.000Z"),
        amount: -9902,
      },
      {
        date: date("2024-01-01T00:00:00.000Z"),
        amount: -1399.927,
      },
      {
        date: date("2024-01-02T00:00:00.000Z"),
        amount: 1400,
      },
      {
        date: date("2024-01-05T00:00:00.000Z"),
        amount: 404.1,
      },
      {
        date: date("2024-01-06T00:00:00.000Z"),
        amount: -404,
      },
      {
        date: date("2024-01-15T00:00:00.000Z"),
        amount: 74502.2,
      },
      {
        date: date("2024-01-16T00:00:00.000Z"),
        amount: -79996.1,
      },
      {
        date: date("2024-01-18T00:00:00.000Z"),
        amount: -24498.8,
      },
      {
        date: date("2024-01-24T00:00:00.000Z"),
        amount: 30051,
      },
      {
        date: date("2024-02-02T00:00:00.000Z"),
        amount: -4998.86,
      },
      {
        date: date("2024-02-09T00:00:00.000Z"),
        amount: 105023.9,
      },
      {
        date: date("2024-02-12T00:00:00.000Z"),
        amount: -105621,
      },
      {
        date: date("2024-02-27T00:00:00.000Z"),
        amount: -15997.613,
      },
      {
        date: date("2024-04-02T00:00:00.000Z"),
        amount: 322.06,
      },
      {
        date: date("2024-04-22T00:00:00.000Z"),
        amount: -40322,
      },
      {
        date: date("2024-04-23T00:00:00.000Z"),
        amount: 19885.298,
      },
      {
        date: date("2024-04-24T00:00:00.000Z"),
        amount: -19997.7,
      },
      {
        date: date("2024-05-06T00:00:00.000Z"),
        amount: -20744.5,
      },
      {
        date: date("2024-05-30T00:00:00.000Z"),
        amount: -23181,
      },
      {
        date: date("2024-06-19T00:00:00.000Z"),
        amount: 544379.64,
      },
      {
        date: date("2024-06-20T00:00:00.000Z"),
        amount: -704506.6,
      },
      {
        date: date("2025-01-20T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-02-01T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-02-07T00:00:00.000Z"),
        amount: 5800,
      },
      {
        date: date("2025-02-11T00:00:00.000Z"),
        amount: 18000,
      },
      {
        date: date("2025-02-12T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-02-24T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-02-28T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-03-02T00:00:00.000Z"),
        amount: -75450,
      },
      {
        date: date("2025-03-03T00:00:00.000Z"),
        amount: -100197,
      },
      {
        date: date("2025-03-25T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-04-03T00:00:00.000Z"),
        amount: 268700,
      },
      {
        date: date("2025-04-07T00:00:00.000Z"),
        amount: -16400,
      },
      {
        date: date("2025-04-22T00:00:00.000Z"),
        amount: 21500,
      },
      {
        date: date("2025-04-23T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-04-24T00:00:00.000Z"),
        amount: -11500,
      },
      {
        date: date("2025-04-25T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-04-28T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-05-03T00:00:00.000Z"),
        amount: 23,
      },
      {
        date: date("2025-05-09T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-05-14T00:00:00.000Z"),
        amount: 62264,
      },
      {
        date: date("2025-05-22T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2025-06-13T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-06-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-06-27T00:00:00.000Z"),
        amount: -8000,
      },
      {
        date: date("2025-07-09T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-07-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-08-05T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-08-08T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-08-18T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-08-19T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2025-09-08T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-09-18T00:00:00.000Z"),
        amount: -16720,
      },
      {
        date: date("2025-09-26T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2025-10-14T00:00:00.000Z"),
        amount: 29500,
      },
      {
        date: date("2025-10-28T00:00:00.000Z"),
        amount: -21000,
      },
      {
        date: date("2026-01-14T00:00:00.000Z"),
        amount: 37000,
      },
      {
        date: date("2026-01-22T00:00:00.000Z"),
        amount: 27000,
      },
      {
        date: date("2026-01-24T00:00:00.000Z"),
        amount: 2000,
      },
      {
        date: date("2026-01-27T00:00:00.000Z"),
        amount: 12000,
      },
      {
        date: date("2026-02-01T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2026-03-04T00:00:00.000Z"),
        amount: -55000,
      },
      {
        date: date("2026-03-10T00:00:00.000Z"),
        amount: -257000,
      },
      {
        date: date("2026-03-11T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-03-20T00:00:00.000Z"),
        amount: -12000,
      },
      {
        date: date("2026-03-27T00:00:00.000Z"),
        amount: -20000,
      },
      {
        date: date("2026-04-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-04-27T00:00:00.000Z"),
        amount: -12000,
      },
      {
        date: date("2026-05-11T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-05-12T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-06-05T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2026-06-17T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2026-06-18T00:00:00.000Z"),
        amount: 101129,
      },
    ],
  },

  stableAssets: {
    totalInvestment: 201598,
    expectedXirr: 44.056524,
    cashflows: [
      {
        date: date("2026-06-29T00:00:00.000Z"),
        amount: 322654.54,
      },
      {
        date: date("2024-06-20T00:00:00.000Z"),
        amount: -132640.2,
      },
      {
        date: date("2025-01-20T00:00:00.000Z"),
        amount: 7490,
      },
      {
        date: date("2025-02-01T00:00:00.000Z"),
        amount: 22900,
      },
      {
        date: date("2025-02-28T00:00:00.000Z"),
        amount: 120000,
      },
      {
        date: date("2025-03-25T00:00:00.000Z"),
        amount: -2500,
      },
      {
        date: date("2025-04-07T00:00:00.000Z"),
        amount: -3750,
      },
      {
        date: date("2025-04-22T00:00:00.000Z"),
        amount: -78500,
      },
      {
        date: date("2025-04-23T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2025-04-24T00:00:00.000Z"),
        amount: -11500,
      },
      {
        date: date("2025-04-25T00:00:00.000Z"),
        amount: -2500,
      },
      {
        date: date("2025-04-28T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-05-03T00:00:00.000Z"),
        amount: 23,
      },
      {
        date: date("2025-05-09T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-05-14T00:00:00.000Z"),
        amount: 62264,
      },
      {
        date: date("2025-05-22T00:00:00.000Z"),
        amount: -25375,
      },
      {
        date: date("2025-06-13T00:00:00.000Z"),
        amount: -2500,
      },
      {
        date: date("2025-06-24T00:00:00.000Z"),
        amount: -19030,
      },
      {
        date: date("2025-06-27T00:00:00.000Z"),
        amount: -8000,
      },
      {
        date: date("2025-07-09T00:00:00.000Z"),
        amount: -11400,
      },
      {
        date: date("2025-07-24T00:00:00.000Z"),
        amount: -13700,
      },
      {
        date: date("2025-08-05T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: date("2025-08-08T00:00:00.000Z"),
        amount: -3750,
      },
      {
        date: date("2025-08-18T00:00:00.000Z"),
        amount: -2300,
      },
      {
        date: date("2025-09-08T00:00:00.000Z"),
        amount: 2340,
      },
      {
        date: date("2025-09-18T00:00:00.000Z"),
        amount: -16720,
      },
      {
        date: date("2025-09-26T00:00:00.000Z"),
        amount: -2750,
      },
      {
        date: date("2025-10-14T00:00:00.000Z"),
        amount: 29500,
      },
      {
        date: date("2025-10-28T00:00:00.000Z"),
        amount: -5250,
      },
      {
        date: date("2026-01-14T00:00:00.000Z"),
        amount: 37000,
      },
      {
        date: date("2026-01-22T00:00:00.000Z"),
        amount: -85800,
      },
      {
        date: date("2026-01-24T00:00:00.000Z"),
        amount: 111800,
      },
      {
        date: date("2026-01-27T00:00:00.000Z"),
        amount: 7000,
      },
      {
        date: date("2026-02-01T00:00:00.000Z"),
        amount: 20000,
      },
      {
        date: date("2026-03-04T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2026-03-10T00:00:00.000Z"),
        amount: -157000,
      },
      {
        date: date("2026-03-11T00:00:00.000Z"),
        amount: 15250,
      },
      {
        date: date("2026-03-20T00:00:00.000Z"),
        amount: -2500,
      },
      {
        date: date("2026-03-27T00:00:00.000Z"),
        amount: -20000,
      },
      {
        date: date("2026-04-27T00:00:00.000Z"),
        amount: -2800,
      },
      {
        date: date("2026-05-11T00:00:00.000Z"),
        amount: -3400,
      },
      {
        date: date("2026-05-12T00:00:00.000Z"),
        amount: 14500,
      },
      {
        date: date("2026-06-05T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2026-06-17T00:00:00.000Z"),
        amount: -4000,
      },
    ],
  },

  unstableAssets: {
    totalInvestment: 539562.397,
    expectedXirr: 8.677300,
    cashflows: [
      {
        date: date("2026-06-29T00:00:00.000Z"),
        amount: 690859,
      },
      {
        date: date("2022-04-27T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: date("2022-05-09T00:00:00.000Z"),
        amount: -6000,
      },
      {
        date: date("2022-05-13T00:00:00.000Z"),
        amount: -300,
      },
      {
        date: date("2022-05-16T00:00:00.000Z"),
        amount: -7000,
      },
      {
        date: date("2022-05-17T00:00:00.000Z"),
        amount: -1500,
      },
      {
        date: date("2022-05-23T00:00:00.000Z"),
        amount: -500,
      },
      {
        date: date("2022-07-19T00:00:00.000Z"),
        amount: 33211,
      },
      {
        date: date("2022-08-02T00:00:00.000Z"),
        amount: -33237,
      },
      {
        date: date("2022-08-19T00:00:00.000Z"),
        amount: 33251,
      },
      {
        date: date("2022-08-25T00:00:00.000Z"),
        amount: -7274,
      },
      {
        date: date("2022-08-26T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2022-09-09T00:00:00.000Z"),
        amount: -17200,
      },
      {
        date: date("2022-09-14T00:00:00.000Z"),
        amount: 17200,
      },
      {
        date: date("2022-09-16T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2022-09-28T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2022-10-06T00:00:00.000Z"),
        amount: 2191.82,
      },
      {
        date: date("2022-10-07T00:00:00.000Z"),
        amount: -2191,
      },
      {
        date: date("2022-10-09T00:00:00.000Z"),
        amount: -22191,
      },
      {
        date: date("2022-10-21T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2022-10-25T00:00:00.000Z"),
        amount: -4999.81,
      },
      {
        date: date("2022-11-25T00:00:00.000Z"),
        amount: -500.004,
      },
      {
        date: date("2022-12-19T00:00:00.000Z"),
        amount: -8500,
      },
      {
        date: date("2022-12-23T00:00:00.000Z"),
        amount: -549.909,
      },
      {
        date: date("2022-12-28T00:00:00.000Z"),
        amount: -12450,
      },
      {
        date: date("2023-01-05T00:00:00.000Z"),
        amount: -15200,
      },
      {
        date: date("2023-01-06T00:00:00.000Z"),
        amount: -11000,
      },
      {
        date: date("2023-01-14T00:00:00.000Z"),
        amount: -8611,
      },
      {
        date: date("2023-01-25T00:00:00.000Z"),
        amount: -605.018,
      },
      {
        date: date("2023-02-22T00:00:00.000Z"),
        amount: -664.914,
      },
      {
        date: date("2023-02-23T00:00:00.000Z"),
        amount: -80000,
      },
      {
        date: date("2023-02-24T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2023-02-27T00:00:00.000Z"),
        amount: -1999.84,
      },
      {
        date: date("2023-03-28T00:00:00.000Z"),
        amount: -23699.95,
      },
      {
        date: date("2023-04-05T00:00:00.000Z"),
        amount: 24847.95,
      },
      {
        date: date("2023-04-07T00:00:00.000Z"),
        amount: -2448,
      },
      {
        date: date("2023-05-17T00:00:00.000Z"),
        amount: 130000,
      },
      {
        date: date("2023-07-07T00:00:00.000Z"),
        amount: 61802.7,
      },
      {
        date: date("2023-07-10T00:00:00.000Z"),
        amount: -182792.43,
      },
      {
        date: date("2023-07-12T00:00:00.000Z"),
        amount: -22434,
      },
      {
        date: date("2023-07-14T00:00:00.000Z"),
        amount: -19000,
      },
      {
        date: date("2023-07-23T00:00:00.000Z"),
        amount: -95051,
      },
      {
        date: date("2023-07-24T00:00:00.000Z"),
        amount: -95500,
      },
      {
        date: date("2023-08-02T00:00:00.000Z"),
        amount: -36100,
      },
      {
        date: date("2023-08-29T00:00:00.000Z"),
        amount: -150,
      },
      {
        date: date("2023-10-04T00:00:00.000Z"),
        amount: -30000,
      },
      {
        date: date("2023-10-06T00:00:00.000Z"),
        amount: 99.34,
      },
      {
        date: date("2023-10-09T00:00:00.000Z"),
        amount: -645,
      },
      {
        date: date("2023-10-26T00:00:00.000Z"),
        amount: -28000,
      },
      {
        date: date("2023-10-31T00:00:00.000Z"),
        amount: 32789.09,
      },
      {
        date: date("2023-11-01T00:00:00.000Z"),
        amount: 57210,
      },
      {
        date: date("2023-11-06T00:00:00.000Z"),
        amount: -4000,
      },
      {
        date: date("2023-11-13T00:00:00.000Z"),
        amount: 40000,
      },
      {
        date: date("2023-12-13T00:00:00.000Z"),
        amount: -221,
      },
      {
        date: date("2023-12-26T00:00:00.000Z"),
        amount: 803.38,
      },
      {
        date: date("2023-12-27T00:00:00.000Z"),
        amount: 99901.77,
      },
      {
        date: date("2023-12-28T00:00:00.000Z"),
        amount: -9902,
      },
      {
        date: date("2024-01-01T00:00:00.000Z"),
        amount: -1399.927,
      },
      {
        date: date("2024-01-02T00:00:00.000Z"),
        amount: 1400,
      },
      {
        date: date("2024-01-05T00:00:00.000Z"),
        amount: 404.1,
      },
      {
        date: date("2024-01-06T00:00:00.000Z"),
        amount: -404,
      },
      {
        date: date("2024-01-15T00:00:00.000Z"),
        amount: 74502.2,
      },
      {
        date: date("2024-01-16T00:00:00.000Z"),
        amount: -79996.1,
      },
      {
        date: date("2024-01-18T00:00:00.000Z"),
        amount: -24498.8,
      },
      {
        date: date("2024-01-24T00:00:00.000Z"),
        amount: 30051,
      },
      {
        date: date("2024-02-02T00:00:00.000Z"),
        amount: -4998.86,
      },
      {
        date: date("2024-02-09T00:00:00.000Z"),
        amount: 105023.9,
      },
      {
        date: date("2024-02-12T00:00:00.000Z"),
        amount: -105621,
      },
      {
        date: date("2024-02-27T00:00:00.000Z"),
        amount: -15997.613,
      },
      {
        date: date("2024-04-02T00:00:00.000Z"),
        amount: 322.06,
      },
      {
        date: date("2024-04-22T00:00:00.000Z"),
        amount: -40322,
      },
      {
        date: date("2024-04-23T00:00:00.000Z"),
        amount: 19885.298,
      },
      {
        date: date("2024-04-24T00:00:00.000Z"),
        amount: -19997.7,
      },
      {
        date: date("2024-05-06T00:00:00.000Z"),
        amount: -20744.5,
      },
      {
        date: date("2024-05-30T00:00:00.000Z"),
        amount: -23181,
      },
      {
        date: date("2024-06-19T00:00:00.000Z"),
        amount: 544379.64,
      },
      {
        date: date("2024-06-20T00:00:00.000Z"),
        amount: -571866.4,
      },
      {
        date: date("2025-01-20T00:00:00.000Z"),
        amount: -17490,
      },
      {
        date: date("2025-02-01T00:00:00.000Z"),
        amount: -22900,
      },
      {
        date: date("2025-02-07T00:00:00.000Z"),
        amount: 5800,
      },
      {
        date: date("2025-02-11T00:00:00.000Z"),
        amount: 18000,
      },
      {
        date: date("2025-02-12T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2025-02-24T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2025-02-28T00:00:00.000Z"),
        amount: -120000,
      },
      {
        date: date("2025-03-02T00:00:00.000Z"),
        amount: -75450,
      },
      {
        date: date("2025-03-03T00:00:00.000Z"),
        amount: -100197,
      },
      {
        date: date("2025-03-25T00:00:00.000Z"),
        amount: -7500,
      },
      {
        date: date("2025-04-03T00:00:00.000Z"),
        amount: 268700,
      },
      {
        date: date("2025-04-07T00:00:00.000Z"),
        amount: -12650,
      },
      {
        date: date("2025-04-22T00:00:00.000Z"),
        amount: 100000,
      },
      {
        date: date("2025-04-25T00:00:00.000Z"),
        amount: -7500,
      },
      {
        date: date("2025-05-22T00:00:00.000Z"),
        amount: 30375,
      },
      {
        date: date("2025-06-13T00:00:00.000Z"),
        amount: -7500,
      },
      {
        date: date("2025-06-24T00:00:00.000Z"),
        amount: 19030,
      },
      {
        date: date("2025-07-09T00:00:00.000Z"),
        amount: 11400,
      },
      {
        date: date("2025-07-24T00:00:00.000Z"),
        amount: 13700,
      },
      {
        date: date("2025-08-08T00:00:00.000Z"),
        amount: -11250,
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
        amount: -8250,
      },
      {
        date: date("2025-10-28T00:00:00.000Z"),
        amount: -15750,
      },
      {
        date: date("2026-01-22T00:00:00.000Z"),
        amount: 112800,
      },
      {
        date: date("2026-01-24T00:00:00.000Z"),
        amount: -109800,
      },
      {
        date: date("2026-01-27T00:00:00.000Z"),
        amount: 5000,
      },
      {
        date: date("2026-02-01T00:00:00.000Z"),
        amount: -15000,
      },
      {
        date: date("2026-03-04T00:00:00.000Z"),
        amount: -40000,
      },
      {
        date: date("2026-03-10T00:00:00.000Z"),
        amount: -100000,
      },
      {
        date: date("2026-03-11T00:00:00.000Z"),
        amount: -15250,
      },
      {
        date: date("2026-03-20T00:00:00.000Z"),
        amount: -9500,
      },
      {
        date: date("2026-04-24T00:00:00.000Z"),
        amount: 0,
      },
      {
        date: date("2026-04-27T00:00:00.000Z"),
        amount: -9200,
      },
      {
        date: date("2026-05-11T00:00:00.000Z"),
        amount: 3400,
      },
      {
        date: date("2026-05-12T00:00:00.000Z"),
        amount: -14500,
      },
      {
        date: date("2026-06-18T00:00:00.000Z"),
        amount: 101129,
      },
    ],
  },

};

module.exports = {
  portfolioXirrMockData,
};
