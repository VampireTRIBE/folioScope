// test/unit_tests/dateUtils/mock/normalizeDates.mock.js

const normalizeDatesMockData = {
  financialYearCases: [
    {
      name: "returns previous financial year when current month is January",
      systemDate: "2026-01-15T10:00:00.000Z",
      expected: "2025-04-01T10:00:00.000Z",
    },
    {
      name: "returns previous financial year when current month is March",
      systemDate: "2026-03-31T23:59:59.999Z",
      expected: "2025-04-01T10:00:00.000Z",
    },
    {
      name: "returns current financial year when current month is April",
      systemDate: "2026-04-01T00:00:00.000Z",
      expected: "2026-04-01T10:00:00.000Z",
    },
    {
      name: "returns current financial year when current month is December",
      systemDate: "2026-12-15T10:00:00.000Z",
      expected: "2026-04-01T10:00:00.000Z",
    },
  ],

  istMidnightCases: [
    {
      name: "normalizes daytime UTC input to same IST day's midnight",
      input: "2024-06-29T11:30:00.000Z",
      expected: "2024-06-28T18:30:00.000Z",
    },
    {
      name: "normalizes just before IST day changes",
      input: "2024-06-29T18:29:59.999Z",
      expected: "2024-06-28T18:30:00.000Z",
    },
    {
      name: "normalizes exactly at next IST midnight",
      input: "2024-06-29T18:30:00.000Z",
      expected: "2024-06-29T18:30:00.000Z",
    },
    {
      name: "normalizes early UTC time to same IST day midnight",
      input: "2024-06-29T00:00:00.000Z",
      expected: "2024-06-28T18:30:00.000Z",
    },
  ],

  istEndOfDayCases: [
    {
      name: "normalizes UTC daytime input to IST end of day",
      input: "2024-06-29T11:30:00.000Z",
      expected: "2024-06-29T18:29:59.999Z",
    },
    {
      name: "normalizes early UTC input to same IST end of day",
      input: "2024-06-29T00:00:00.000Z",
      expected: "2024-06-29T18:29:59.999Z",
    },
    {
      name: "normalizes UTC 18:30 to next IST day end",
      input: "2024-06-29T18:30:00.000Z",
      expected: "2024-06-30T18:29:59.999Z",
    },
  ],

  ist5PMCases: [
    {
      name: "normalizes input to 5 PM IST",
      input: "2024-06-29T00:00:00.000Z",
      expected: "2024-06-29T11:30:00.000Z",
    },
    {
      name: "normalizes UTC 18:30 input to next IST day's 5 PM",
      input: "2024-06-29T18:30:00.000Z",
      expected: "2024-06-30T11:30:00.000Z",
    },
  ],

  ist330PMCases: [
    {
      name: "normalizes input to 3:30 PM IST",
      input: "2024-06-29T00:00:00.000Z",
      expected: "2024-06-29T10:00:00.000Z",
    },
    {
      name: "normalizes UTC 18:30 input to next IST day's 3:30 PM",
      input: "2024-06-29T18:30:00.000Z",
      expected: "2024-06-30T10:00:00.000Z",
    },
  ],

  invalidInputs: [
    {
      name: "invalid string date",
      input: "invalid-date",
    },
    {
      name: "undefined input",
      input: undefined,
    },
  ],
};

module.exports = {
  normalizeDatesMockData,
};