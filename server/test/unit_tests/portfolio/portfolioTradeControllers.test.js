// test/unit_tests/portfolio/portfolioTradeControllers.test.js

jest.mock("../../../controllers/portfolio/tradeActions/trade", () => ({
  tradeTransaction: jest.fn(),
}));

jest.mock("../../../sync_Scripts/sync_Portfolio/sync_Portfolio", () => ({
  sync_FillFutureNAVs: jest.fn(),
  sync_Portfolio: jest.fn(),
}));

const {
  tradeTransaction,
} = require("../../../controllers/portfolio/tradeActions/trade");
const {
  sync_FillFutureNAVs,
  sync_Portfolio,
} = require("../../../sync_Scripts/sync_Portfolio/sync_Portfolio");
const { trade } = require("../../../controllers/portfolio/portfolioTradeControllers");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const createRequest = () => ({
  userId: "user-id",
  body: {
    date: "2026-06-29T10:00:00.000Z",
  },
});

describe("portfolioTradeControllers.trade", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 400 when trade transaction fails", async () => {
    tradeTransaction.mockResolvedValue({
      success: false,
      message: "Insufficient funds",
    });
    const res = createResponse();

    await trade(createRequest(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Transaction Failed",
      error: "Insufficient funds",
    });
    expect(sync_FillFutureNAVs).not.toHaveBeenCalled();
  });

  test("returns 400 when future NAV sync fails after successful trade", async () => {
    tradeTransaction.mockResolvedValue({
      success: true,
      message: "done",
    });
    sync_FillFutureNAVs.mockResolvedValue({ success: false });
    const res = createResponse();

    await trade(createRequest(), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: true,
      message: "Transaction Successful but NavSync Failed. It will sync later.",
    });
    expect(sync_Portfolio).not.toHaveBeenCalled();
  });

  test("returns success when trade, NAV sync, and portfolio sync all pass", async () => {
    tradeTransaction.mockResolvedValue({
      success: true,
      message: "done",
    });
    sync_FillFutureNAVs.mockResolvedValue({ success: true });
    sync_Portfolio.mockResolvedValue({ success: true });
    const res = createResponse();

    await trade(createRequest(), res);

    expect(sync_FillFutureNAVs).toHaveBeenCalledWith(
      "user-id",
      "2026-06-29T10:00:00.000Z",
    );
    expect(sync_Portfolio).toHaveBeenCalledWith("user-id");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Trade, Sync & NAV Update Completed Successfully",
    });
  });
});
