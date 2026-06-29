// test/unit_tests/analytics/ComparisonAnalytics/default_NavComparison.test.js

jest.mock("../../../../utils/mongodb/aggregations/get_AssetsPrice", () => ({
  get_DailyClosePricesByAsset: jest.fn(),
}));

jest.mock("../../../../utils/shared/tools/computationFormula/drawdown", () => ({
  comparisonDrawdownFunction: jest.fn(),
}));

const {
  default_NavComparison,
} = require("../../../../utils/analytics/ComparisonAnalytics/default_NavComparison");

const {
  get_DailyClosePricesByAsset,
} = require("../../../../utils/mongodb/aggregations/get_AssetsPrice");

const {
  comparisonDrawdownFunction,
} = require("../../../../utils/shared/tools/computationFormula/drawdown");

const {
  mockIds,
  mockSession,
  mockStartDate,
  fullNavSeries,
  fullIndexSeries,
  partialNavSeries,
  partialIndexSeries,
  singlePointNavSeries,
  singlePointIndexSeries,
  dateKeyFromOffset,
} = require("./mock/ComparisonAnalytics.mock");

describe("default_NavComparison", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    comparisonDrawdownFunction.mockImplementation(
      (currentDate, startDate, series) => ({
        group: {
          current: -5,
          max: -20,
          peakDate: startDate,
          troughDate: currentDate,
          recoveryDate: null,
          recoveryDays: null,
          points: Object.keys(series).length,
        },
        index: {
          current: -3,
          max: -10,
          peakDate: startDate,
          troughDate: currentDate,
          recoveryDate: null,
          recoveryDays: null,
          points: Object.keys(series).length,
        },
      }),
    );
  });

  test("throws when required parameters are missing", async () => {
    await expect(
      default_NavComparison({
        indexId: mockIds.indexId,
        groupId: mockIds.groupId,
        startDate: mockStartDate,
      }),
    ).rejects.toThrow("Missing Request Parameters");
  });

  test("returns empty analytics when NAV history has fewer than two points", async () => {
    get_DailyClosePricesByAsset
      .mockResolvedValueOnce(singlePointIndexSeries)
      .mockResolvedValueOnce(singlePointNavSeries);

    const result = await default_NavComparison({
      indexId: mockIds.indexId,
      groupId: mockIds.groupId,
      userId: mockIds.userId,
      startDate: mockStartDate,
      session: mockSession,
    });

    expect(result).toEqual({
      standalone: {},
      comparison: {},
    });

    expect(comparisonDrawdownFunction).not.toHaveBeenCalled();
  });

  test("builds full period normalized NAV comparison analytics", async () => {
    get_DailyClosePricesByAsset
      .mockResolvedValueOnce(fullIndexSeries)
      .mockResolvedValueOnce(fullNavSeries);

    const result = await default_NavComparison({
      indexId: mockIds.indexId,
      groupId: mockIds.groupId,
      userId: mockIds.userId,
      startDate: mockStartDate,
      session: mockSession,
    });

    expect(get_DailyClosePricesByAsset).toHaveBeenNthCalledWith(
      1,
      mockIds.indexId,
      new Date(mockStartDate),
      false,
      null,
      mockSession,
    );

    expect(get_DailyClosePricesByAsset).toHaveBeenNthCalledWith(
      2,
      mockIds.groupId,
      new Date(mockStartDate),
      true,
      mockIds.userId,
      mockSession,
    );

    const { navBasedAnalytics, normalizeNavsSeries, groupCurveValue } = result;

    expect(normalizeNavsSeries[dateKeyFromOffset(0)]).toEqual({
      index: 200,
      group: 200,
    });

    expect(normalizeNavsSeries[dateKeyFromOffset(89)]).toEqual({
      index: 100,
      group: 100,
    });

    expect(groupCurveValue[dateKeyFromOffset(0)]).toBe(2000);

    expect(
      navBasedAnalytics.standalone[mockIds.groupId].ThreeMonths,
    ).toBeUndefined();

    expect(
      navBasedAnalytics.standalone[mockIds.groupId]["3Months"].return,
    ).toBeCloseTo(100, 2);

    expect(
      navBasedAnalytics.standalone[mockIds.indexId]["1Year"].return,
    ).toBeCloseTo(150, 2);

    expect(
      navBasedAnalytics.standalone[mockIds.groupId]["3Year"].return,
    ).toBeCloseTo(300, 2);

    expect(navBasedAnalytics.comparison["3Months"].excessReturn).toBeCloseTo(
      0,
      2,
    );

    expect(navBasedAnalytics.comparison["3Months"].excessDrawdown).toEqual({
      current: -2,
      max: -10,
    });

    expect(comparisonDrawdownFunction).toHaveBeenCalledTimes(3);
    expect(comparisonDrawdownFunction).toHaveBeenNthCalledWith(
      1,
      dateKeyFromOffset(0),
      dateKeyFromOffset(89),
      normalizeNavsSeries,
    );
    expect(comparisonDrawdownFunction).toHaveBeenNthCalledWith(
      2,
      dateKeyFromOffset(0),
      dateKeyFromOffset(364),
      normalizeNavsSeries,
    );
    expect(comparisonDrawdownFunction).toHaveBeenNthCalledWith(
      3,
      dateKeyFromOffset(0),
      dateKeyFromOffset(1094),
      normalizeNavsSeries,
    );
  });

  test("returns partial comparison analytics when fewer than 90 NAV points exist", async () => {
    get_DailyClosePricesByAsset
      .mockResolvedValueOnce(partialIndexSeries)
      .mockResolvedValueOnce(partialNavSeries);

    const result = await default_NavComparison({
      indexId: mockIds.indexId,
      groupId: mockIds.groupId,
      userId: mockIds.userId,
      startDate: mockStartDate,
      session: mockSession,
    });

    const { navBasedAnalytics, normalizeNavsSeries } = result;

    expect(Object.keys(navBasedAnalytics.standalone[mockIds.groupId])).toEqual([
      "3MonthsPartial",
    ]);

    expect(
      navBasedAnalytics.standalone[mockIds.groupId][
        "3MonthsPartial"
      ].return,
    ).toBeCloseTo(20, 2);

    expect(
      navBasedAnalytics.standalone[mockIds.indexId][
        "3MonthsPartial"
      ].return,
    ).toBeCloseTo(25, 2);

    expect(
      navBasedAnalytics.comparison["3MonthsPartial"].excessReturn,
    ).toBeCloseTo(-5, 2);

    expect(comparisonDrawdownFunction).toHaveBeenCalledTimes(1);
    expect(comparisonDrawdownFunction).toHaveBeenCalledWith(
      dateKeyFromOffset(0),
      dateKeyFromOffset(44),
      normalizeNavsSeries,
    );
  });
});
