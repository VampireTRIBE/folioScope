// test/unit_tests/analytics/ComparisonAnalytics/default_XirrComparison.test.js

jest.mock("../../../../utils/mongodb/aggregations/get_AssetsPrice", () => ({
  get_DailyClosePricesByAsset: jest.fn(),
}));

jest.mock("../../../../utils/mongodb/aggregations/get_Cashflows", () => ({
  build_GroupCashflows: jest.fn(),
}));

jest.mock("../../../../utils/mongodb/aggregations/get_GroupCurrentValue", () => ({
  get_GroupCurrentValue: jest.fn(),
}));

jest.mock("../../../../utils/mongodb/aggregations/get_leafGroupIDsByGroup", () => ({
  get_leafGroupIDsByGroup: jest.fn(),
}));

jest.mock("../../../../utils/shared/tools/computationFormula/xirr", () => ({
  computeIRR: jest.fn(),
}));

const {
  default_XirrComparison,
} = require("../../../../utils/analytics/ComparisonAnalytics/default_XirrComparison");

const {
  get_DailyClosePricesByAsset,
} = require("../../../../utils/mongodb/aggregations/get_AssetsPrice");

const {
  build_GroupCashflows,
} = require("../../../../utils/mongodb/aggregations/get_Cashflows");

const {
  get_GroupCurrentValue,
} = require("../../../../utils/mongodb/aggregations/get_GroupCurrentValue");

const {
  get_leafGroupIDsByGroup,
} = require("../../../../utils/mongodb/aggregations/get_leafGroupIDsByGroup");

const {
  computeIRR,
} = require("../../../../utils/shared/tools/computationFormula/xirr");

const {
  mockIds,
  mockSession,
  fixedToday,
  fixedTodayMidnight,
  createCashflowsWithoutToday,
  createCashflowsWithToday,
  indexPricesForXirr,
} = require("./mock/ComparisonAnalytics.mock");

describe("default_XirrComparison", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.useFakeTimers();
    jest.setSystemTime(new Date(fixedToday));

    get_GroupCurrentValue.mockResolvedValue(18000);
    get_DailyClosePricesByAsset.mockResolvedValue(indexPricesForXirr);
    computeIRR.mockReturnValueOnce(12.5).mockReturnValueOnce(10.25);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("throws a custom error when required parameters are missing", async () => {
    await expect(
      default_XirrComparison(null, mockIds.userId, mockIds.indexId),
    ).rejects.toMatchObject({
      message: "Missing Parameters",
      statusCode: 400,
    });
  });

  test("uses original group id when group has no leaf groups", async () => {
    const cashflows = createCashflowsWithoutToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    build_GroupCashflows.mockResolvedValue(cashflows);

    const result = await default_XirrComparison(
      mockIds.groupId,
      mockIds.userId,
      mockIds.indexId,
      mockSession,
    );

    expect(get_leafGroupIDsByGroup).toHaveBeenCalledWith(
      mockIds.groupId,
      mockIds.userId,
    );

    expect(get_GroupCurrentValue).toHaveBeenCalledWith(
      mockIds.groupId,
      mockIds.userId,
    );

    expect(build_GroupCashflows).toHaveBeenCalledWith(
      mockIds.userId,
      [mockIds.groupId],
      mockSession,
    );

    expect(get_DailyClosePricesByAsset).toHaveBeenCalledWith(
      mockIds.indexId,
      new Date("2025-01-01T00:00:00.000Z"),
      false,
      null,
      null,
      fixedTodayMidnight,
    );

    const groupCashflows = computeIRR.mock.calls[0][0];
    const indexCashflows = computeIRR.mock.calls[1][0];

    expect(groupCashflows).toEqual([
      {
        date: new Date("2025-01-01T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: new Date("2026-01-01T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: fixedTodayMidnight,
        amount: 18000,
      },
    ]);

    expect(indexCashflows).toEqual([
      {
        date: new Date("2025-01-01T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: new Date("2026-01-01T00:00:00.000Z"),
        amount: -5000,
      },
      {
        date: fixedTodayMidnight,
        amount: 21000,
      },
    ]);

    expect(result).toEqual({
      xirrAnalysis: {
        _ids: {
          groupId: mockIds.groupId,
          indexId: mockIds.indexId,
        },
        groupXirr: "12.50",
        indexXirr: "10.25",
        alpha: "2.25",
      },
    });
  });

  test("uses leaf group ids when group has children", async () => {
    const cashflows = createCashflowsWithoutToday();
    const leafGroupIds = [mockIds.leafGroupId1, mockIds.leafGroupId2];

    get_leafGroupIDsByGroup.mockResolvedValue(leafGroupIds);
    build_GroupCashflows.mockResolvedValue(cashflows);

    await default_XirrComparison(
      mockIds.groupId,
      mockIds.userId,
      mockIds.indexId,
      mockSession,
    );

    expect(build_GroupCashflows).toHaveBeenCalledWith(
      mockIds.userId,
      leafGroupIds,
      mockSession,
    );
  });

  test("replaces today's last group cashflow with current value", async () => {
    const cashflows = createCashflowsWithToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    build_GroupCashflows.mockResolvedValue(cashflows);

    await default_XirrComparison(
      mockIds.groupId,
      mockIds.userId,
      mockIds.indexId,
      mockSession,
    );

    const groupCashflows = computeIRR.mock.calls[0][0];

    expect(groupCashflows).toEqual([
      {
        date: new Date("2025-01-01T00:00:00.000Z"),
        amount: -10000,
      },
      {
        date: fixedTodayMidnight,
        amount: 18000,
      },
    ]);
  });

  test("wraps computation dependency failures in a custom error", async () => {
    get_leafGroupIDsByGroup.mockRejectedValue(new Error("leaf failed"));

    await expect(
      default_XirrComparison(
        mockIds.groupId,
        mockIds.userId,
        mockIds.indexId,
        mockSession,
      ),
    ).rejects.toMatchObject({
      message: "Error in Computation",
      statusCode: 422,
    });
  });
});
