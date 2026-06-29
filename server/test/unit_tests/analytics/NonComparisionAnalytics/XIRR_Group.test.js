// test/unit_tests/xirr/XIRR_Group.test.js

// ======================================================
// MOCK DEPENDENCIES FIRST
// ======================================================

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

// ======================================================
// IMPORTS
// ======================================================

const {
  XIRR_Group,
} = require("../../../../utils/analytics/NonComparisonAnalytics/XIRR_Calculation");

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
  mockCurrentValue,
  fixedToday,
  fixedTodayMidnight,
  createCashflowsWithoutToday,
  createCashflowsWithToday,
  createEmptyCashflows,
} = require("./mock/XIRR_Group.mock");

describe("XIRR_Group", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.useFakeTimers();
    jest.setSystemTime(new Date(fixedToday));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ======================================================
  // VALIDATION TESTS
  // ======================================================

  test("throws error when groupId is missing", async () => {
    await expect(
      XIRR_Group(null, mockIds.userId),
    ).rejects.toThrow("Missing Parameters");
  });

  test("throws error when userId is missing", async () => {
    await expect(
      XIRR_Group(mockIds.groupId, null),
    ).rejects.toThrow("Missing Parameters");
  });

  // ======================================================
  // LEAF GROUP BRANCH
  // ======================================================

  test("uses original groupId when group has no leaf groups", async () => {
    const cashflows = createCashflowsWithoutToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockReturnValue(12.3456);

    const result = await XIRR_Group(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(get_leafGroupIDsByGroup).toHaveBeenCalledTimes(1);
    expect(get_leafGroupIDsByGroup).toHaveBeenCalledWith(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(get_GroupCurrentValue).toHaveBeenCalledTimes(1);
    expect(get_GroupCurrentValue).toHaveBeenCalledWith(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(build_GroupCashflows).toHaveBeenCalledTimes(1);
    expect(build_GroupCashflows).toHaveBeenCalledWith(
      mockIds.userId,
      [mockIds.groupId],
      mockSession,
    );

    expect(result).toBe("12.35");
  });

  test("uses leaf group ids when group has leaf groups", async () => {
    const cashflows = createCashflowsWithoutToday();

    const leafGroupIds = [
      mockIds.leafGroupId1,
      mockIds.leafGroupId2,
    ];

    get_leafGroupIDsByGroup.mockResolvedValue(leafGroupIds);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockReturnValue(15.6789);

    const result = await XIRR_Group(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(build_GroupCashflows).toHaveBeenCalledTimes(1);
    expect(build_GroupCashflows).toHaveBeenCalledWith(
      mockIds.userId,
      leafGroupIds,
      mockSession,
    );

    expect(result).toBe("15.68");
  });

  // ======================================================
  // CURRENT VALUE CASHFLOW HANDLING
  // ======================================================

  test("appends current value as today's cashflow when last cashflow is not today", async () => {
    const cashflows = createCashflowsWithoutToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockReturnValue(10);

    const result = await XIRR_Group(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(result).toBe("10.00");

    expect(computeIRR).toHaveBeenCalledTimes(1);

    const receivedCashflows = computeIRR.mock.calls[0][0];

    expect(receivedCashflows).toHaveLength(3);

    expect(receivedCashflows[2]).toEqual({
      date: fixedTodayMidnight,
      amount: mockCurrentValue,
    });
  });

  test("replaces today's last cashflow with current value when last cashflow is already today", async () => {
    const cashflows = createCashflowsWithToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockReturnValue(11.1111);

    const result = await XIRR_Group(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(result).toBe("11.11");

    expect(computeIRR).toHaveBeenCalledTimes(1);

    const receivedCashflows = computeIRR.mock.calls[0][0];

    expect(receivedCashflows).toHaveLength(2);

    expect(receivedCashflows[1]).toEqual({
      date: fixedTodayMidnight,
      amount: mockCurrentValue,
    });
  });

  test("adds current value as only cashflow when groupCashflows is empty", async () => {
    const cashflows = createEmptyCashflows();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockReturnValue(0);

    const result = await XIRR_Group(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(result).toBe("0.00");

    const receivedCashflows = computeIRR.mock.calls[0][0];

    expect(receivedCashflows).toEqual([
      {
        date: fixedTodayMidnight,
        amount: mockCurrentValue,
      },
    ]);
  });

  // ======================================================
  // RETURN FORMAT TESTS
  // ======================================================

  test("returns XIRR as string with 2 decimal places", async () => {
    const cashflows = createCashflowsWithoutToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockReturnValue(13.4291906853);

    const result = await XIRR_Group(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(result).toBe("13.43");
    expect(typeof result).toBe("string");
  });

  test("handles negative XIRR and returns string with 2 decimal places", async () => {
    const cashflows = createCashflowsWithoutToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockReturnValue(-5.6789);

    const result = await XIRR_Group(
      mockIds.groupId,
      mockIds.userId,
      mockSession,
    );

    expect(result).toBe("-5.68");
  });

  // ======================================================
  // ERROR HANDLING TESTS
  // ======================================================

  test("throws custom computation error when get_leafGroupIDsByGroup fails", async () => {
    get_leafGroupIDsByGroup.mockRejectedValue(new Error("leaf error"));
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);

    await expect(
      XIRR_Group(mockIds.groupId, mockIds.userId, mockSession),
    ).rejects.toThrow("Error IN computation");
  });

  test("throws custom computation error when get_GroupCurrentValue fails", async () => {
    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockRejectedValue(new Error("current value error"));

    await expect(
      XIRR_Group(mockIds.groupId, mockIds.userId, mockSession),
    ).rejects.toThrow("Error IN computation");
  });

  test("throws custom computation error when build_GroupCashflows fails", async () => {
    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockRejectedValue(new Error("cashflow error"));

    await expect(
      XIRR_Group(mockIds.groupId, mockIds.userId, mockSession),
    ).rejects.toThrow("Error IN computation");
  });

  test("throws custom computation error when computeIRR throws", async () => {
    const cashflows = createCashflowsWithoutToday();

    get_leafGroupIDsByGroup.mockResolvedValue([]);
    get_GroupCurrentValue.mockResolvedValue(mockCurrentValue);
    build_GroupCashflows.mockResolvedValue(cashflows);
    computeIRR.mockImplementation(() => {
      throw new Error("xirr error");
    });

    await expect(
      XIRR_Group(mockIds.groupId, mockIds.userId, mockSession),
    ).rejects.toThrow("Error IN computation");
  });
});
