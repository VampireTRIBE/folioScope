// test/unit_tests/analytics/NonComparisionAnalytics/PRICE_Drawdown_Analytics.test.js

jest.mock(
  "../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache",
  () => ({
    get_SingleAssetMetaDataName: jest.fn(),
  }),
);

jest.mock("../../../../utils/mongodb/aggregations/get_AssetsPrice", () => ({
  get_DailyClosePricesByAsset: jest.fn(),
}));

jest.mock("../../../../utils/shared/tools/computationFormula/drawdown", () => ({
  singleDrawdownFunction: jest.fn(),
}));

const {
  priceDrawdownAnalysis,
} = require("../../../../utils/analytics/NonComparisonAnalytics/PRICE_Drawdown_Analytics");

const {
  get_SingleAssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

const {
  get_DailyClosePricesByAsset,
} = require("../../../../utils/mongodb/aggregations/get_AssetsPrice");

const {
  singleDrawdownFunction,
} = require("../../../../utils/shared/tools/computationFormula/drawdown");

const {
  mockIds,
  mockSession,
  mockStartDate,
  mockSecurityDetail,
  fullPriceSeries,
  partialPriceSeries,
  singlePointPriceSeries,
  navPriceSeries,
  dateKeyFromOffset,
} = require("./mock/PRICE_Drawdown_Analytics.mock");

describe("priceDrawdownAnalysis", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    singleDrawdownFunction.mockImplementation(
      (currentDate, startDate, series) => ({
        current: -2,
        max: -12,
        peakDate: startDate,
        troughDate: currentDate,
        recoveryDate: null,
        recoveryDays: null,
        points: Object.keys(series).length,
      }),
    );
  });

  test("throws a custom error when assetId is missing", async () => {
    await expect(
      priceDrawdownAnalysis({
        startDate: mockStartDate,
      }),
    ).rejects.toMatchObject({
      message: "Missing Request Parameters",
      statusCode: 400,
    });
  });

  test("throws a custom error when startDate is missing", async () => {
    await expect(
      priceDrawdownAnalysis({
        assetId: mockIds.assetName,
      }),
    ).rejects.toMatchObject({
      message: "Missing Request Parameters",
      statusCode: 400,
    });
  });

  test("throws a custom error when asset metadata is not available", async () => {
    get_SingleAssetMetaDataName.mockReturnValue(null);

    await expect(
      priceDrawdownAnalysis({
        assetId: mockIds.assetName,
        startDate: mockStartDate,
        session: mockSession,
      }),
    ).rejects.toMatchObject({
      message: "Data Not Available",
      statusCode: 404,
    });

    expect(get_DailyClosePricesByAsset).not.toHaveBeenCalled();
  });

  test("builds 3 month, 1 year, and 3 year price drawdown analytics", async () => {
    get_SingleAssetMetaDataName.mockReturnValue(mockSecurityDetail);
    get_DailyClosePricesByAsset.mockResolvedValue(fullPriceSeries);

    const result = await priceDrawdownAnalysis({
      assetId: mockIds.assetName,
      startDate: mockStartDate,
      session: mockSession,
    });

    expect(get_SingleAssetMetaDataName).toHaveBeenCalledWith(
      mockIds.assetName,
    );

    expect(get_DailyClosePricesByAsset).toHaveBeenCalledWith(
      mockIds.assetMetadataId,
      new Date(mockStartDate),
      false,
      mockSession,
    );

    expect(result[mockIds.assetName]["3 Months"].return).toBeCloseTo(60, 2);
    expect(result[mockIds.assetName]["1 Year"].return).toBeCloseTo(100, 2);
    expect(result[mockIds.assetName]["3 Year"].return).toBeCloseTo(300, 2);

    expect(result[mockIds.assetName]["3 Months"].drawdown).toEqual({
      current: -2,
      max: -12,
      peakDate: dateKeyFromOffset(89),
      troughDate: dateKeyFromOffset(0),
      recoveryDate: null,
      recoveryDays: null,
      points: 1095,
    });

    expect(singleDrawdownFunction).toHaveBeenCalledTimes(3);

    expect(singleDrawdownFunction).toHaveBeenNthCalledWith(
      1,
      dateKeyFromOffset(0),
      dateKeyFromOffset(89),
      fullPriceSeries,
    );

    expect(singleDrawdownFunction).toHaveBeenNthCalledWith(
      2,
      dateKeyFromOffset(0),
      dateKeyFromOffset(364),
      fullPriceSeries,
    );

    expect(singleDrawdownFunction).toHaveBeenNthCalledWith(
      3,
      dateKeyFromOffset(0),
      dateKeyFromOffset(1094),
      fullPriceSeries,
    );
  });

  test("returns a 3 month partial result when fewer than 90 price points exist", async () => {
    get_SingleAssetMetaDataName.mockReturnValue(mockSecurityDetail);
    get_DailyClosePricesByAsset.mockResolvedValue(partialPriceSeries);

    const result = await priceDrawdownAnalysis({
      assetId: mockIds.assetName,
      startDate: mockStartDate,
      session: mockSession,
    });

    expect(Object.keys(result[mockIds.assetName])).toEqual([
      "3 MonthsPartial",
    ]);

    expect(
      result[mockIds.assetName]["3 MonthsPartial"].return,
    ).toBeCloseTo(10, 2);

    expect(singleDrawdownFunction).toHaveBeenCalledTimes(1);
    expect(singleDrawdownFunction).toHaveBeenCalledWith(
      dateKeyFromOffset(0),
      dateKeyFromOffset(44),
      partialPriceSeries,
    );
  });

  test("returns an empty result when price history has fewer than two points", async () => {
    get_SingleAssetMetaDataName.mockReturnValue(mockSecurityDetail);
    get_DailyClosePricesByAsset.mockResolvedValue(singlePointPriceSeries);

    const result = await priceDrawdownAnalysis({
      assetId: mockIds.assetName,
      startDate: mockStartDate,
      session: mockSession,
    });

    expect(result).toEqual({});
    expect(singleDrawdownFunction).not.toHaveBeenCalled();
  });

  test("formats NAV price data before calculating drawdown analytics", async () => {
    get_DailyClosePricesByAsset.mockResolvedValue(navPriceSeries);

    const result = await priceDrawdownAnalysis({
      assetId: mockIds.navGroupId,
      startDate: mockStartDate,
      nav: true,
      userID: mockIds.userId,
      session: mockSession,
    });

    expect(get_SingleAssetMetaDataName).not.toHaveBeenCalled();

    expect(get_DailyClosePricesByAsset).toHaveBeenCalledWith(
      mockIds.navGroupId,
      new Date(mockStartDate),
      true,
      mockIds.userId,
      mockSession,
    );

    expect(result[mockIds.navGroupId]["3 Months"].return).toBeCloseTo(50, 2);
    expect(result[mockIds.navGroupId]["1 YearPartial"].return).toBeCloseTo(
      50,
      2,
    );

    const normalizedNavSeries = singleDrawdownFunction.mock.calls[0][2];
    expect(normalizedNavSeries[dateKeyFromOffset(0)]).toBe(150);
    expect(normalizedNavSeries[dateKeyFromOffset(89)]).toBe(100);
  });
});
