// test/unit_tests/portfolio/tradeNavHoldings.integration.test.js

jest.mock("../../../controllers/portfolio/tradeActions/trade", () => ({
  tradeTransaction: jest.fn(),
}));

jest.mock("../../../sync_Scripts/sync_Portfolio/sync_Portfolio", () => ({
  sync_FillFutureNAVs: jest.fn(),
  sync_Portfolio: jest.fn(),
}));

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/read_FinancialAsset_Models/read_User_Holdings",
  () => ({
    read_User_Holdings: jest.fn(),
  }),
);

const {
  tradeTransaction,
} = require("../../../controllers/portfolio/tradeActions/trade");
const {
  sync_FillFutureNAVs,
  sync_Portfolio,
} = require("../../../sync_Scripts/sync_Portfolio/sync_Portfolio");
const {
  read_User_Holdings,
} = require("../../../utils/mongodb/aggregations/readModels/read_FinancialAsset_Models/read_User_Holdings");
const {
  trade,
} = require("../../../controllers/portfolio/portfolioTradeControllers");
const {
  fetch_UserHoldings,
} = require("../../../controllers/portfolio/portfolioGroupControllers");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("trade to NAV to holdings integration flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("successful trade fills future NAVs, syncs portfolio, and holdings read model exposes updated position", async () => {
    const calls = [];

    tradeTransaction.mockImplementation(async () => {
      calls.push("trade");
      return {
        success: true,
        message: "Transaction Completed",
      };
    });
    sync_FillFutureNAVs.mockImplementation(async () => {
      calls.push("future-nav");
      return { success: true };
    });
    sync_Portfolio.mockImplementation(async () => {
      calls.push("portfolio-sync");
      return { success: true };
    });
    read_User_Holdings.mockImplementation(async () => {
      calls.push("holdings-read");
      return {
        totalStats: {
          investedValue: 1000,
          currentValue: 1250,
        },
        userHoldings: [
          {
            name: "NIFTYBEES",
            qty: 10,
            invested: 1000,
            current: 1250,
          },
        ],
      };
    });

    const tradeRes = createResponse();
    await trade(
      {
        userId: "user-id",
        body: {
          date: "2026-06-29T10:00:00.000Z",
          type: "buy",
          qty: 10,
          price: 100,
        },
      },
      tradeRes,
    );

    expect(sync_FillFutureNAVs).toHaveBeenCalledWith(
      "user-id",
      "2026-06-29T10:00:00.000Z",
    );
    expect(sync_Portfolio).toHaveBeenCalledWith("user-id");
    expect(tradeRes.status).toHaveBeenCalledWith(200);

    const holdingsRes = createResponse();
    await fetch_UserHoldings(
      {
        userId: "user-id",
        body: {
          groupId: "group-id",
        },
      },
      holdingsRes,
      jest.fn(),
    );

    expect(read_User_Holdings).toHaveBeenCalledWith({
      filterObj: {
        portfolioGroupId: "group-id",
        userId: "user-id",
        status: true,
      },
    });
    expect(holdingsRes.status).toHaveBeenCalledWith(200);
    expect(holdingsRes.json).toHaveBeenCalledWith({
      success: true,
      message: "Metadata Fetched",
      data: {
        totalStats: {
          investedValue: 1000,
          currentValue: 1250,
        },
        userHoldings: [
          {
            name: "NIFTYBEES",
            qty: 10,
            invested: 1000,
            current: 1250,
          },
        ],
      },
    });
    expect(calls).toEqual([
      "trade",
      "future-nav",
      "portfolio-sync",
      "holdings-read",
    ]);
  });

  test("holdings are not read when future NAV sync fails after trade", async () => {
    tradeTransaction.mockResolvedValue({
      success: true,
      message: "Transaction Completed",
    });
    sync_FillFutureNAVs.mockResolvedValue({ success: false });
    const res = createResponse();

    await trade(
      {
        userId: "user-id",
        body: {
          date: "2026-06-29T10:00:00.000Z",
        },
      },
      res,
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(sync_Portfolio).not.toHaveBeenCalled();
    expect(read_User_Holdings).not.toHaveBeenCalled();
  });
});
