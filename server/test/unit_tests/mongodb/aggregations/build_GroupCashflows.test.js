// test/unit_tests/cashflows/build_GroupCashflows.test.js

const mongoose = require("mongoose");

// Change this path according to your actual file location
const { build_GroupCashflows } = require("../../../../utils/mongodb/aggregations/get_Cashflows");

const {
  mockIds,
  mockSession,
  mockAggregatedCashflows,
  emptyAggregatedCashflows,
  createMockAggregateQuery,
  buildExpectedPipeline,
} = require("./mock/build_GroupCashflows.mock");

describe("build_GroupCashflows", () => {
  let GroupStatementMock;

  beforeEach(() => {
    jest.clearAllMocks();

    GroupStatementMock = {
      aggregate: jest.fn(),
    };

    jest.spyOn(mongoose, "model").mockReturnValue(GroupStatementMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ======================================================
  // VALIDATION TESTS
  // ======================================================

  test("throws error when userId is missing", async () => {
    await expect(
      build_GroupCashflows(null, [mockIds.groupId1]),
    ).rejects.toThrow("userId and groupIds are required");
  });

  test("throws error when groupIds is missing", async () => {
    await expect(
      build_GroupCashflows(mockIds.userId, null),
    ).rejects.toThrow("userId and groupIds are required");
  });

  test("throws error when groupIds is not an array", async () => {
    await expect(
      build_GroupCashflows(mockIds.userId, mockIds.groupId1),
    ).rejects.toThrow("userId and groupIds are required");
  });

  test("throws error when groupIds array is empty", async () => {
    await expect(
      build_GroupCashflows(mockIds.userId, []),
    ).rejects.toThrow("userId and groupIds are required");
  });

  // ======================================================
  // MODEL TEST
  // ======================================================

  test("uses groupStatement mongoose model", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    expect(mongoose.model).toHaveBeenCalledTimes(1);
    expect(mongoose.model).toHaveBeenCalledWith("groupStatement");
  });

  // ======================================================
  // PIPELINE TESTS
  // ======================================================

  test("builds correct aggregation pipeline with one groupId", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];

    const expectedPipeline = buildExpectedPipeline({
      userId: mockIds.userId,
      groupIds: [mockIds.groupId1],
    });

    expect(receivedPipeline).toEqual(expectedPipeline);
  });

  test("builds correct aggregation pipeline with multiple groupIds", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [
      mockIds.groupId1,
      mockIds.groupId2,
      mockIds.groupId3,
    ]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];

    const expectedPipeline = buildExpectedPipeline({
      userId: mockIds.userId,
      groupIds: [mockIds.groupId1, mockIds.groupId2, mockIds.groupId3],
    });

    expect(receivedPipeline).toEqual(expectedPipeline);
  });

  test("match stage filters by userId, groupIds, and excludes tax", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [
      mockIds.groupId1,
      mockIds.groupId2,
    ]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];
    const matchStage = receivedPipeline[0].$match;

    expect(matchStage.userId).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(matchStage.userId.toString()).toBe(mockIds.userId);

    expect(matchStage.portfolioGroupId.$in).toHaveLength(2);
    expect(
      matchStage.portfolioGroupId.$in.map((id) => id.toString()),
    ).toEqual([mockIds.groupId1, mockIds.groupId2]);

    expect(matchStage.type).toEqual({
      $ne: "tax",
    });
  });

  test("project stage converts deposit amount into negative cashflow", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];

    expect(receivedPipeline[1].$project.amount).toEqual({
      $cond: [
        {
          $eq: ["$type", "deposit"],
        },
        {
          $multiply: ["$amount", -1],
        },
        "$amount",
      ],
    });
  });

  test("project stage truncates date to UTC day", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];

    expect(receivedPipeline[1].$project.date).toEqual({
      $dateTrunc: {
        date: "$date",
        unit: "day",
        timezone: "UTC",
      },
    });
  });

  test("group stage groups cashflows by date and sums amount", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];

    expect(receivedPipeline[2]).toEqual({
      $group: {
        _id: "$date",
        amount: {
          $sum: "$amount",
        },
      },
    });
  });

  test("final project stage returns date and amount only", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];

    expect(receivedPipeline[3]).toEqual({
      $project: {
        _id: 0,
        date: {
          $toDate: "$_id",
        },
        amount: 1,
      },
    });
  });

  test("sort stage sorts final cashflows by date ascending", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    const receivedPipeline = GroupStatementMock.aggregate.mock.calls[0][0];

    expect(receivedPipeline[4]).toEqual({
      $sort: {
        date: 1,
      },
    });
  });

  // ======================================================
  // SESSION TESTS
  // ======================================================

  test("does not apply session when session is null", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(mockIds.userId, [mockIds.groupId1]);

    expect(query.session).not.toHaveBeenCalled();
  });

  test("applies session when session is provided", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    await build_GroupCashflows(
      mockIds.userId,
      [mockIds.groupId1],
      mockSession,
    );

    expect(query.session).toHaveBeenCalledTimes(1);
    expect(query.session).toHaveBeenCalledWith(mockSession);
  });

  // ======================================================
  // RETURN VALUE TESTS
  // ======================================================

  test("returns aggregated cashflow result", async () => {
    const query = createMockAggregateQuery(mockAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    const result = await build_GroupCashflows(mockIds.userId, [
      mockIds.groupId1,
    ]);

    expect(result).toEqual(mockAggregatedCashflows);
  });

  test("returns empty array when aggregation returns no cashflows", async () => {
    const query = createMockAggregateQuery(emptyAggregatedCashflows);

    GroupStatementMock.aggregate.mockReturnValue(query);

    const result = await build_GroupCashflows(mockIds.userId, [
      mockIds.groupId1,
    ]);

    expect(result).toEqual([]);
  });
});