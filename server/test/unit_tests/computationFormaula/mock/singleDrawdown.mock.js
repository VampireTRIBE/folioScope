// test/unit_tests/computationFormaula/mock/singleDrawdown.mock.js

const dateKey = (date) => `${date}T11:30:00.000Z`;

const singleDrawdownMockData = {
  flatSeries: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-03"),
    series: {
      [dateKey("2024-01-01")]: 100,
      [dateKey("2024-01-02")]: 100,
      [dateKey("2024-01-03")]: 100,
    },
  },

  openDrawdown: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-01")]: 100,
      [dateKey("2024-01-02")]: 120,
      [dateKey("2024-01-03")]: 90,
      [dateKey("2024-01-04")]: 95,
    },
  },

  recoveredDrawdown: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-01")]: 100,
      [dateKey("2024-01-02")]: 120,
      [dateKey("2024-01-03")]: 90,
      [dateKey("2024-01-04")]: 121,
    },
  },

  multipleRecoveredDrawdowns: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-06"),
    series: {
      [dateKey("2024-01-01")]: 100,
      [dateKey("2024-01-02")]: 120,
      [dateKey("2024-01-03")]: 100,
      [dateKey("2024-01-04")]: 121,
      [dateKey("2024-01-05")]: 110,
      [dateKey("2024-01-06")]: 130,
    },
  },

  openDrawdownWorseThanRecoveredDrawdown: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-06"),
    series: {
      [dateKey("2024-01-01")]: 100,
      [dateKey("2024-01-02")]: 120,
      [dateKey("2024-01-03")]: 100,
      [dateKey("2024-01-04")]: 121,
      [dateKey("2024-01-05")]: 80,
      [dateKey("2024-01-06")]: 90,
    },
  },

  dateRangeFilter: {
    startDate: dateKey("2024-01-02"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-01")]: 500,
      [dateKey("2024-01-02")]: 100,
      [dateKey("2024-01-03")]: 80,
      [dateKey("2024-01-04")]: 90,
      [dateKey("2024-01-05")]: 1000,
    },
  },

  noDataInRange: {
    startDate: dateKey("2024-02-01"),
    currentDate: dateKey("2024-02-10"),
    series: {
      [dateKey("2024-01-01")]: 100,
      [dateKey("2024-01-02")]: 90,
      [dateKey("2024-01-03")]: 110,
    },
  },

  unsortedSeries: {
    startDate: dateKey("2024-01-01"),
    currentDate: dateKey("2024-01-04"),
    series: {
      [dateKey("2024-01-04")]: 95,
      [dateKey("2024-01-01")]: 100,
      [dateKey("2024-01-03")]: 90,
      [dateKey("2024-01-02")]: 120,
    },
  },
};

module.exports = {
  dateKey,
  singleDrawdownMockData,
};