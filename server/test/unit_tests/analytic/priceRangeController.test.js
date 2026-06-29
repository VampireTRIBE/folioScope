// test/unit_tests/analytic/priceRangeController.test.js

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/readpriceRange/priceRange",
  () => ({
    read_PriceRange1D: jest.fn(),
    read_PriceRange: jest.fn(),
    read_GroupPriceRange1D: jest.fn(),
    read_GroupPriceRange: jest.fn(),
  }),
);

const priceRangeReads = require("../../../utils/mongodb/aggregations/readModels/readpriceRange/priceRange");
const {
  priceRange,
  groupPriceRange,
} = require("../../../controllers/analytic/priceRange/priceRangeController");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("priceRangeController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-29T10:00:00.000Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("priceRange returns 1D range when range query is absent", async () => {
    priceRangeReads.read_PriceRange1D.mockResolvedValue([{ close: 100 }]);
    const req = {
      params: { securityId: "security-id" },
      query: {},
    };
    const res = createResponse();
    const next = jest.fn();

    await priceRange(req, res, next);

    expect(priceRangeReads.read_PriceRange1D).toHaveBeenCalledWith(
      "security-id",
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "1D Price Range",
      data: [{ close: 100 }],
    });
  });

  test("priceRange maps W range to a one-week start date", async () => {
    priceRangeReads.read_PriceRange.mockResolvedValue([{ close: 101 }]);
    const req = {
      params: { securityId: "security-id" },
      query: { range: "W" },
    };
    const res = createResponse();
    const next = jest.fn();

    await priceRange(req, res, next);

    expect(priceRangeReads.read_PriceRange).toHaveBeenCalledWith(
      "security-id",
      new Date("2026-06-22T10:00:00.000Z"),
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "W Price Range",
      data: [{ close: 101 }],
    });
  });

  test("groupPriceRange maps MAX range to unbounded group read", async () => {
    priceRangeReads.read_GroupPriceRange.mockResolvedValue([{ nav: 100 }]);
    const req = {
      userId: "user-id",
      params: { groupId: "group-id" },
      query: { range: "MAX" },
    };
    const res = createResponse();
    const next = jest.fn();

    await groupPriceRange(req, res, next);

    expect(priceRangeReads.read_GroupPriceRange).toHaveBeenCalledWith(
      "group-id",
      "user-id",
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("invalid range is passed to error middleware", async () => {
    const req = {
      params: { securityId: "security-id" },
      query: { range: "BAD" },
    };
    const res = createResponse();
    const next = jest.fn();

    await priceRange(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Invalid Request",
        statusCode: 400,
      }),
    );
  });
});
