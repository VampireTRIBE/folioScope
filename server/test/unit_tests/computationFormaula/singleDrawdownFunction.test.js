// test/unit_tests/computationFormaula/singleDrawdownFunction.test.js

const {
  singleDrawdownFunction,
} = require("../../../utils/shared/tools/computationFormula/drawdown");

const {
  dateKey,
  singleDrawdownMockData,
} = require("./mock/singleDrawdown.mock");

describe("singleDrawdownFunction", () => {
  test("returns undefined when currentDate is missing", () => {
    const result = singleDrawdownFunction(
      null,
      dateKey("2024-01-01"),
      singleDrawdownMockData.flatSeries.series,
    );

    expect(result).toBeUndefined();
  });

  test("returns undefined when startDate is missing", () => {
    const result = singleDrawdownFunction(
      dateKey("2024-01-03"),
      null,
      singleDrawdownMockData.flatSeries.series,
    );

    expect(result).toBeUndefined();
  });

  test("returns undefined when normalizeNavsSeries is missing", () => {
    const result = singleDrawdownFunction(
      dateKey("2024-01-03"),
      dateKey("2024-01-01"),
      null,
    );

    expect(result).toBeUndefined();
  });

  test("returns default drawdown object when no data exists inside date range", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.noDataInRange;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    expect(result).toEqual({
      current: 0,
      max: 0,
      peakDate: null,
      troughDate: null,
      recoveryDate: null,
      recoveryDays: null,
    });
  });

  test("returns zero drawdown for flat NAV series", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.flatSeries;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    expect(result.current).toBeCloseTo(0, 2);
    expect(result.max).toBeCloseTo(0, 2);

    expect(result.peakDate).toBe(dateKey("2024-01-01"));
    expect(result.troughDate).toBe(dateKey("2024-01-01"));
    expect(result.recoveryDate).toBeNull();
    expect(result.recoveryDays).toBeNull();
  });

  test("calculates open unrecovered drawdown correctly", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.openDrawdown;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    expect(result.max).toBeCloseTo(-25, 2);
    expect(result.current).toBeCloseTo(-20.83, 2);

    expect(result.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.recoveryDate).toBeNull();
    expect(result.recoveryDays).toBeNull();
  });

  test("calculates recovered drawdown correctly", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.recoveredDrawdown;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    expect(result.max).toBeCloseTo(-25, 2);
    expect(result.current).toBeCloseTo(0, 2);

    expect(result.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.recoveryDate).toBe(dateKey("2024-01-04"));
    expect(result.recoveryDays).toBe(2);
  });

  test("keeps the worst recovered drawdown when multiple recovered drawdowns exist", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.multipleRecoveredDrawdowns;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    // First drawdown:
    // Peak 120 -> trough 100 = -16.67%
    //
    // Second drawdown:
    // Peak 121 -> trough 110 = -9.09%
    //
    // Worst is first drawdown.
    expect(result.max).toBeCloseTo(-16.67, 2);
    expect(result.current).toBeCloseTo(0, 2);

    expect(result.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.recoveryDate).toBe(dateKey("2024-01-04"));
    expect(result.recoveryDays).toBe(2);
  });

  test("uses open drawdown as max when open drawdown is worse than recovered drawdown", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.openDrawdownWorseThanRecoveredDrawdown;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    // Recovered drawdown:
    // Peak 120 -> trough 100 = -16.67%
    //
    // Open drawdown:
    // Peak 121 -> trough 80 = -33.88%
    //
    // Current drawdown:
    // Peak 121 -> last price 90 = -25.62%
    expect(result.max).toBeCloseTo(-33.88, 2);
    expect(result.current).toBeCloseTo(-25.62, 2);

    expect(result.peakDate).toBe(dateKey("2024-01-04"));
    expect(result.troughDate).toBe(dateKey("2024-01-05"));
    expect(result.recoveryDate).toBeNull();
    expect(result.recoveryDays).toBeNull();
  });

  test("filters NAV data using startDate and currentDate", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.dateRangeFilter;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    // It should ignore:
    // 2024-01-01 value 500
    // 2024-01-05 value 1000
    //
    // Only this range is used:
    // 2024-01-02 = 100
    // 2024-01-03 = 80
    // 2024-01-04 = 90
    expect(result.max).toBeCloseTo(-20, 2);
    expect(result.current).toBeCloseTo(-10, 2);

    expect(result.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.recoveryDate).toBeNull();
    expect(result.recoveryDays).toBeNull();
  });

  test("sorts date keys chronologically before calculating drawdown", () => {
    const { startDate, currentDate, series } =
      singleDrawdownMockData.unsortedSeries;

    const result = singleDrawdownFunction(currentDate, startDate, series);

    expect(result.max).toBeCloseTo(-25, 2);
    expect(result.current).toBeCloseTo(-20.83, 2);
    expect(result.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.recoveryDate).toBeNull();
    expect(result.recoveryDays).toBeNull();
  });
});