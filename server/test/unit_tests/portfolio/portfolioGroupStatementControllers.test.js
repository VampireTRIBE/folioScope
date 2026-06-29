// test/unit_tests/portfolio/portfolioGroupStatementControllers.test.js

const mockSession = {
  withTransaction: jest.fn(async (callback) => callback()),
  endSession: jest.fn(),
};

jest.mock("mongoose", () => ({
  startSession: jest.fn(async () => mockSession),
}));

const mockPortfolioGroupModel = {
  findOneAndUpdate: jest.fn(),
  updateOne: jest.fn(),
  updateMany: jest.fn(),
};

jest.mock(
  "../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup",
  () => mockPortfolioGroupModel,
);

const mockPortfolioGroupStatementModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

jest.mock(
  "../../../models/Portfolio_Models/ledger_Models/groupStatement",
  () => mockPortfolioGroupStatementModel,
);

const mockLedgerStatementModel = {
  findOne: jest.fn(),
};

jest.mock(
  "../../../models/Portfolio_Models/ledger_Models/ledgerStatement",
  () => mockLedgerStatementModel,
);

jest.mock("../../../utils/mongodb/aggregations/check_Leaf", () => ({
  is_Leaf: jest.fn(),
}));

jest.mock("../../../sync_Scripts/sync_Portfolio/update_GroupNAV", () => ({
  update_GroupNAV: jest.fn(),
}));

jest.mock("../../../sync_Scripts/sync_Portfolio/fill_MissingNavs", () => ({
  fill_MissingNAVs: jest.fn(),
}));

jest.mock("../../../sync_Scripts/sync_Portfolio/sync_Portfolio", () => ({
  sync_FillFutureNAVs: jest.fn(),
}));

const { is_Leaf } = require("../../../utils/mongodb/aggregations/check_Leaf");
const {
  update_GroupNAV,
} = require("../../../sync_Scripts/sync_Portfolio/update_GroupNAV");
const {
  fill_MissingNAVs,
} = require("../../../sync_Scripts/sync_Portfolio/fill_MissingNavs");
const {
  sync_FillFutureNAVs,
} = require("../../../sync_Scripts/sync_Portfolio/sync_Portfolio");
const {
  groupstatementTransaction,
} = require("../../../controllers/portfolio/portfolioGroupStatementControllers");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const statementChain = (value) => ({
  sort: jest.fn().mockResolvedValue(value),
});

describe("groupstatementTransaction", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSession.withTransaction.mockImplementation(async (callback) =>
      callback(),
    );
    mockPortfolioGroupModel.findOneAndUpdate.mockResolvedValue({
      _id: "group-id",
    });
    mockPortfolioGroupModel.updateOne.mockResolvedValue({});
    mockPortfolioGroupModel.updateMany.mockResolvedValue({});
    mockPortfolioGroupStatementModel.findOne.mockReturnValue(
      statementChain(null),
    );
    mockLedgerStatementModel.findOne.mockReturnValue(statementChain(null));
    mockPortfolioGroupStatementModel.create.mockResolvedValue([{ _id: "tx" }]);
    is_Leaf.mockResolvedValue({
      userId: { toString: () => "user-id" },
      isLeaf: true,
      path: ["root-id"],
      consolidatedCash: 1000,
    });
    fill_MissingNAVs.mockResolvedValue({ filled: 1 });
    update_GroupNAV.mockResolvedValue({ success: true });
    sync_FillFutureNAVs.mockResolvedValue({ success: true });
  });

  test("creates a leaf group deposit, updates cash and NAV, then syncs future NAVs", async () => {
    const res = createResponse();
    const req = {
      userId: "user-id",
      params: { pg_id: "group-id" },
      body: {
        type: "deposit",
        amount: 500,
        date: "2026-06-29T10:00:00.000Z",
      },
    };

    await groupstatementTransaction(req, res);

    expect(mockPortfolioGroupModel.findOneAndUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "group-id" }),
      expect.objectContaining({
        $set: expect.objectContaining({ "lock.isLocked": true }),
      }),
      expect.objectContaining({ session: mockSession }),
    );
    expect(fill_MissingNAVs).toHaveBeenCalledWith(
      "user-id",
      mockSession,
      new Date("2026-06-29T10:00:00.000Z"),
      new Date("2026-06-29T10:00:00.000Z"),
    );
    expect(mockPortfolioGroupStatementModel.create).toHaveBeenCalledWith(
      [
        {
          portfolioGroupId: "group-id",
          userId: "user-id",
          date: "2026-06-29T10:00:00.000Z",
          type: "deposit",
          amount: 500,
        },
      ],
      { session: mockSession },
    );
    expect(mockPortfolioGroupModel.updateMany).toHaveBeenCalledWith(
      { _id: { $in: ["root-id", "group-id"] } },
      {
        $inc: {
          consolidatedCash: 500,
          consolidatedCurrentValue: 500,
        },
      },
      { session: mockSession },
    );
    expect(update_GroupNAV).toHaveBeenCalledTimes(2);
    expect(sync_FillFutureNAVs).toHaveBeenCalledWith(
      "user-id",
      "2026-06-29T10:00:00.000Z",
    );
    expect(mockPortfolioGroupModel.updateOne).toHaveBeenCalledWith(
      { _id: "group-id" },
      { $set: { "lock.isLocked": false } },
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("rejects non-leaf group transactions and releases the lock", async () => {
    is_Leaf.mockResolvedValue({
      userId: { toString: () => "user-id" },
      isLeaf: false,
      path: ["root-id"],
      consolidatedCash: 1000,
    });
    const res = createResponse();

    await groupstatementTransaction(
      {
        userId: "user-id",
        params: { pg_id: "group-id" },
        body: {
          type: "deposit",
          amount: 500,
          date: "2026-06-29T10:00:00.000Z",
        },
      },
      res,
    );

    expect(mockPortfolioGroupModel.updateOne).toHaveBeenCalledWith(
      { _id: "group-id" },
      { $set: { "lock.isLocked": false } },
    );
    expect(mockPortfolioGroupStatementModel.create).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Allowed only on leaf nodes",
    });
  });

  test("rejects backdated transactions against latest statement date", async () => {
    mockPortfolioGroupStatementModel.findOne.mockReturnValue(
      statementChain({ date: "2026-06-29T10:00:00.000Z" }),
    );
    const res = createResponse();

    await groupstatementTransaction(
      {
        userId: "user-id",
        params: { pg_id: "group-id" },
        body: {
          type: "deposit",
          amount: 500,
          date: "2026-06-29T10:00:00.000Z",
        },
      },
      res,
    );

    expect(fill_MissingNAVs).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Backdated or same timestamp transaction not allowed",
    });
  });
});
