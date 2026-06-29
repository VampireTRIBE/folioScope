// test/unit_tests/computationFormaula/comparisonDrawdownFunction.test.js

const {
  comparisonDrawdownFunction,
} = require("../../../utils/shared/tools/computationFormula/drawdown");

const {
  dateKey,
  comparisonDrawdownMockData,
} = require("./mock/comparisonDrawdown.mock");

describe("comparisonDrawdownFunction", () => {
  test("returns undefined when currentDate is missing", () => {
    const result = comparisonDrawdownFunction(
      null,
      dateKey("2024-01-01"),
      comparisonDrawdownMockData.flatSeries.series,
    );

    expect(result).toBeUndefined();
  });

  test("returns undefined when startDate is missing", () => {
    const result = comparisonDrawdownFunction(
      dateKey("2024-01-03"),
      null,
      comparisonDrawdownMockData.flatSeries.series,
    );

    expect(result).toBeUndefined();
  });

  test("returns undefined when normalizeNavsSeries is missing", () => {
    const result = comparisonDrawdownFunction(
      dateKey("2024-01-03"),
      dateKey("2024-01-01"),
      null,
    );

    expect(result).toBeUndefined();
  });

  test("returns default drawdown object when no data exists inside date range", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.noDataInRange;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    expect(result).toEqual({
      index: {
        current: 0,
        max: 0,
        peakDate: null,
        troughDate: null,
        recoveryDate: null,
        recoveryDays: null,
      },
      group: {
        current: 0,
        max: 0,
        peakDate: null,
        troughDate: null,
        recoveryDate: null,
        recoveryDays: null,
      },
    });
  });

  test("returns zero drawdown for flat index and group series", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.flatSeries;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    expect(result.index.current).toBeCloseTo(0, 2);
    expect(result.index.max).toBeCloseTo(0, 2);
    expect(result.group.current).toBeCloseTo(0, 2);
    expect(result.group.max).toBeCloseTo(0, 2);

    expect(result.index.peakDate).toBe(dateKey("2024-01-01"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-01"));
    expect(result.index.recoveryDate).toBeNull();
    expect(result.index.recoveryDays).toBeNull();

    expect(result.group.peakDate).toBe(dateKey("2024-01-01"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-01"));
    expect(result.group.recoveryDate).toBeNull();
    expect(result.group.recoveryDays).toBeNull();
  });

  test("calculates open unrecovered drawdown for index and group", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.openDrawdown;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    // INDEX:
    // Peak 120 -> trough 90 = -25%
    // Peak 120 -> current 95 = -20.83%
    expect(result.index.max).toBeCloseTo(-25, 2);
    expect(result.index.current).toBeCloseTo(-20.83, 2);
    expect(result.index.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.index.recoveryDate).toBeNull();
    expect(result.index.recoveryDays).toBeNull();

    // GROUP:
    // Peak 110 -> trough 100 = -9.09%
    // Peak 110 -> current 105 = -4.55%
    expect(result.group.max).toBeCloseTo(-9.09, 2);
    expect(result.group.current).toBeCloseTo(-4.55, 2);
    expect(result.group.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.group.recoveryDate).toBeNull();
    expect(result.group.recoveryDays).toBeNull();
  });

  test("calculates recovered drawdown for index and group", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.recoveredDrawdown;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    expect(result.index.max).toBeCloseTo(-25, 2);
    expect(result.index.current).toBeCloseTo(0, 2);
    expect(result.index.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.index.recoveryDate).toBe(dateKey("2024-01-04"));
    expect(result.index.recoveryDays).toBe(2);

    expect(result.group.max).toBeCloseTo(-9.09, 2);
    expect(result.group.current).toBeCloseTo(0, 2);
    expect(result.group.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.group.recoveryDate).toBe(dateKey("2024-01-04"));
    expect(result.group.recoveryDays).toBe(2);
  });

  test("handles index recovered but group still unrecovered", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.indexRecoveredGroupOpen;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    // INDEX recovered on 2024-01-04.
    expect(result.index.max).toBeCloseTo(-25, 2);
    expect(result.index.current).toBeCloseTo(0, 2);
    expect(result.index.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.index.recoveryDate).toBe(dateKey("2024-01-04"));
    expect(result.index.recoveryDays).toBe(2);

    // GROUP did not recover because 105 is still below old peak 110.
    expect(result.group.max).toBeCloseTo(-9.09, 2);
    expect(result.group.current).toBeCloseTo(-4.55, 2);
    expect(result.group.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.group.recoveryDate).toBeNull();
    expect(result.group.recoveryDays).toBeNull();
  });

  test("keeps different worst recovered drawdowns for index and group", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.multipleRecoveredDrawdowns;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    // INDEX:
    // First drawdown: 120 -> 100 = -16.67%
    // Second drawdown: 121 -> 110 = -9.09%
    // Worst is first drawdown.
    expect(result.index.max).toBeCloseTo(-16.67, 2);
    expect(result.index.current).toBeCloseTo(0, 2);
    expect(result.index.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.index.recoveryDate).toBe(dateKey("2024-01-04"));
    expect(result.index.recoveryDays).toBe(2);

    // GROUP:
    // First drawdown: 110 -> 105 = -4.55%
    // Second drawdown: 111 -> 100 = -9.91%
    // Worst is second drawdown.
    expect(result.group.max).toBeCloseTo(-9.91, 2);
    expect(result.group.current).toBeCloseTo(0, 2);
    expect(result.group.peakDate).toBe(dateKey("2024-01-04"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-05"));
    expect(result.group.recoveryDate).toBe(dateKey("2024-01-06"));
    expect(result.group.recoveryDays).toBe(2);
  });

  test("uses open drawdown as max when open drawdown is worse than recovered drawdown", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.openDrawdownWorseThanRecoveredDrawdown;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    // INDEX:
    // Recovered drawdown: 120 -> 100 = -16.67%
    // Open drawdown: 121 -> 80 = -33.88%
    // Current drawdown: 121 -> 90 = -25.62%
    expect(result.index.max).toBeCloseTo(-33.88, 2);
    expect(result.index.current).toBeCloseTo(-25.62, 2);
    expect(result.index.peakDate).toBe(dateKey("2024-01-04"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-05"));
    expect(result.index.recoveryDate).toBeNull();
    expect(result.index.recoveryDays).toBeNull();

    // GROUP:
    // Recovered drawdown: 110 -> 105 = -4.55%
    // Open drawdown: 111 -> 90 = -18.92%
    // Current drawdown: 111 -> 95 = -14.41%
    expect(result.group.max).toBeCloseTo(-18.92, 2);
    expect(result.group.current).toBeCloseTo(-14.41, 2);
    expect(result.group.peakDate).toBe(dateKey("2024-01-04"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-05"));
    expect(result.group.recoveryDate).toBeNull();
    expect(result.group.recoveryDays).toBeNull();
  });

  test("filters NAV data using startDate and currentDate", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.dateRangeFilter;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    // It should ignore:
    // 2024-01-01 value 500
    // 2024-01-05 value 1000
    //
    // Only this range is used:
    // 2024-01-02, 2024-01-03, 2024-01-04.
    expect(result.index.max).toBeCloseTo(-20, 2);
    expect(result.index.current).toBeCloseTo(-10, 2);
    expect(result.index.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.index.recoveryDate).toBeNull();
    expect(result.index.recoveryDays).toBeNull();

    expect(result.group.max).toBeCloseTo(-10, 2);
    expect(result.group.current).toBeCloseTo(-5, 2);
    expect(result.group.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.group.recoveryDate).toBeNull();
    expect(result.group.recoveryDays).toBeNull();
  });

  test("sorts date keys chronologically before calculating drawdown", () => {
    const { startDate, currentDate, series } =
      comparisonDrawdownMockData.unsortedSeries;

    const result = comparisonDrawdownFunction(currentDate, startDate, series);

    expect(result.index.max).toBeCloseTo(-25, 2);
    expect(result.index.current).toBeCloseTo(-20.83, 2);
    expect(result.index.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.index.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.index.recoveryDate).toBeNull();
    expect(result.index.recoveryDays).toBeNull();

    expect(result.group.max).toBeCloseTo(-9.09, 2);
    expect(result.group.current).toBeCloseTo(-4.55, 2);
    expect(result.group.peakDate).toBe(dateKey("2024-01-02"));
    expect(result.group.troughDate).toBe(dateKey("2024-01-03"));
    expect(result.group.recoveryDate).toBeNull();
    expect(result.group.recoveryDays).toBeNull();
  });
});
