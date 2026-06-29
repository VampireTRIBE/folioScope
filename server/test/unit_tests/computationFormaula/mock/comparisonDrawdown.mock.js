// test/unit_tests/computationFormaula/mock/comparisonDrawdown.mock.js

const dateKey = (date) => `${date}T11:30:00.000Z`;

const comparisonDrawdownMockData = {
  flatSeries: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-03"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-03")]: {
        index: 100,
        group: 100,
      },
    },
  },

  openDrawdown: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 120,
        group: 110,
      },
      [dateKey("2024-01-03")]: {
        index: 90,
        group: 100,
      },
      [dateKey("2024-01-04")]: {
        index: 95,
        group: 105,
      },
    },
  },

  recoveredDrawdown: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 120,
        group: 110,
      },
      [dateKey("2024-01-03")]: {
        index: 90,
        group: 100,
      },
      [dateKey("2024-01-04")]: {
        index: 121,
        group: 111,
      },
    },
  },

  indexRecoveredGroupOpen: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 120,
        group: 110,
      },
      [dateKey("2024-01-03")]: {
        index: 90,
        group: 100,
      },
      [dateKey("2024-01-04")]: {
        index: 121,
        group: 105,
      },
    },
  },

  multipleRecoveredDrawdowns: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-06"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 120,
        group: 110,
      },
      [dateKey("2024-01-03")]: {
        index: 100,
        group: 105,
      },
      [dateKey("2024-01-04")]: {
        index: 121,
        group: 111,
      },
      [dateKey("2024-01-05")]: {
        index: 110,
        group: 100,
      },
      [dateKey("2024-01-06")]: {
        index: 130,
        group: 112,
      },
    },
  },

  openDrawdownWorseThanRecoveredDrawdown: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-06"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 120,
        group: 110,
      },
      [dateKey("2024-01-03")]: {
        index: 100,
        group: 105,
      },
      [dateKey("2024-01-04")]: {
        index: 121,
        group: 111,
      },
      [dateKey("2024-01-05")]: {
        index: 80,
        group: 90,
      },
      [dateKey("2024-01-06")]: {
        index: 90,
        group: 95,
      },
    },
  },

  dateRangeFilter: {
    startDate: dateKey("2024-01-02"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 500,
        group: 500,
      },
      [dateKey("2024-01-02")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-03")]: {
        index: 80,
        group: 90,
      },
      [dateKey("2024-01-04")]: {
        index: 90,
        group: 95,
      },
      [dateKey("2024-01-05")]: {
        index: 1000,
        group: 1000,
      },
    },
  },

  noDataInRange: {
    startDate: dateKey("2024-02-01"),
    currentDate: dateKey("2024-02-10"),
    series: {
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 90,
        group: 95,
      },
      [dateKey("2024-01-03")]: {
        index: 110,
        group: 105,
      },
    },
  },

  unsortedSeries: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-04")]: {
        index: 95,
        group: 105,
      },
      [dateKey("2024-01-01")]: {
        index: 100,
        group: 100,
      },
      [dateKey("2024-01-03")]: {
        index: 90,
        group: 100,
      },
      [dateKey("2024-01-02")]: {
        index: 120,
        group: 110,
      },
    },
  },
};

module.exports = {
  dateKey,
  comparisonDrawdownMockData,
};