// test/unit_tests/analytic/priceAnalyticController.test.js

const mockSession = {
  withTransaction: jest.fn(async (callback) => callback()),
  endSession: jest.fn(),
};

jest.mock("mongoose", () => ({
  startSession: jest.fn(async () => mockSession),
}));

const mockPortfolioGroupModel = {
  findOne: jest.fn(),
};

jest.mock(
  "../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup",
  () => mockPortfolioGroupModel,
);

jest.mock(
  "../../../utils/analytics/NonComparisonAnalytics/PRICE_Drawdown_Analytics",
  () => ({
    priceDrawdownAnalysis: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/analytics/NonComparisonAnalytics/XIRR_Calculation",
  () => ({
    XIRR_Group: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/analytics/ComparisonAnalytics/default_XirrComparison",
  () => ({
    default_XirrComparison: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/analytics/ComparisonAnalytics/default_NavComparison",
  () => ({
    default_NavComparison: jest.fn(),
  }),
);

const {
  priceDrawdownAnalysis,
} = require("../../../utils/analytics/NonComparisonAnalytics/PRICE_Drawdown_Analytics");
const {
  XIRR_Group,
} = require("../../../utils/analytics/NonComparisonAnalytics/XIRR_Calculation");
const {
  default_XirrComparison,
} = require("../../../utils/analytics/ComparisonAnalytics/default_XirrComparison");
const {
  default_NavComparison,
} = require("../../../utils/analytics/ComparisonAnalytics/default_NavComparison");
const controllers = require("../../../controllers/analytic/PriceAnalytic/priceAnalyticController");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const groupQuery = (portfolioGroup) => ({
  session: jest.fn().mockResolvedValue(portfolioGroup),
});

describe("priceAnalyticController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-29T10:00:00.000Z"));
    mockSession.withTransaction.mockImplementation(async (callback) =>
      callback(),
    );
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("priceSecurityDrawdownAnalytic returns first drawdown bucket for security", async () => {
    priceDrawdownAnalysis.mockResolvedValue({
      "3Months": { current: -2, max: -8 },
    });
    const res = createResponse();

    await controllers.priceSecurityDrawdownAnalytic(
      { params: { securityId: "security-id" } },
      res,
      jest.fn(),
    );

    expect(priceDrawdownAnalysis).toHaveBeenCalledWith({
      assetId: "security-id",
      startDate: "2021-05-19T10:30:00.000+00:00",
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Price Drawdown Analysis",
      data: { current: -2, max: -8 },
    });
  });

  test("priceGroupDrawdownAnalytic reads NAV drawdown for authenticated group", async () => {
    priceDrawdownAnalysis.mockResolvedValue({
      "1Year": { current: -1, max: -5 },
    });
    const res = createResponse();

    await controllers.priceGroupDrawdownAnalytic(
      { userId: "user-id", params: { groupId: "group-id" } },
      res,
      jest.fn(),
    );

    expect(priceDrawdownAnalysis).toHaveBeenCalledWith({
      assetId: "group-id",
      startDate: "2021-05-19T10:30:00.000+00:00",
      nav: true,
      userID: "user-id",
    });
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("xirrAnalytic reuses fresh cached group XIRR", async () => {
    const portfolioGroup = {
      groupSnapshot: {
        groupXirr: {
          xirr: "12.50",
          lastcomputed: new Date("2026-06-29T09:30:00.000Z"),
        },
      },
      set: jest.fn(),
      save: jest.fn(),
    };
    mockPortfolioGroupModel.findOne.mockReturnValue(groupQuery(portfolioGroup));
    const res = createResponse();

    await controllers.xirrAnalytic(
      { userId: "user-id", params: { groupId: "group-id" } },
      res,
      jest.fn(),
    );

    expect(XIRR_Group).not.toHaveBeenCalled();
    expect(portfolioGroup.save).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Group Xirr Analysis",
      data: "12.50",
    });
  });

  test("xirrAnalytic recomputes stale cached group XIRR inside transaction", async () => {
    const portfolioGroup = {
      groupSnapshot: {
        groupXirr: {
          xirr: "8.00",
          lastcomputed: new Date("2026-06-27T09:30:00.000Z"),
        },
      },
      set: jest.fn((path, value) => {
        portfolioGroup.groupSnapshot.groupXirr = value;
      }),
      save: jest.fn().mockResolvedValue(undefined),
      $locals: {},
    };
    mockPortfolioGroupModel.findOne.mockReturnValue(groupQuery(portfolioGroup));
    XIRR_Group.mockResolvedValue("13.40");
    const res = createResponse();

    await controllers.xirrAnalytic(
      { userId: "user-id", params: { groupId: "group-id" } },
      res,
      jest.fn(),
    );

    expect(XIRR_Group).toHaveBeenCalledWith("group-id", "user-id", mockSession);
    expect(portfolioGroup.set).toHaveBeenCalledWith("groupSnapshot.groupXirr", {
      xirr: "13.40",
      lastcomputed: new Date("2026-06-29T10:00:00.000Z"),
    });
    expect(portfolioGroup.$locals.parent).toBe("xirr");
    expect(portfolioGroup.save).toHaveBeenCalledWith({ session: mockSession });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Group Xirr Analysis",
      data: "13.40",
    });
  });

  test("xirrComparison and navComparison delegate to comparison analytics", async () => {
    default_XirrComparison.mockResolvedValue({ excessXirr: 2 });
    default_NavComparison.mockResolvedValue({ comparison: {} });
    const xirrRes = createResponse();
    const navRes = createResponse();

    await controllers.xirrComparison(
      {
        userId: "user-id",
        params: { groupId: "group-id", indexId: "index-id" },
      },
      xirrRes,
      jest.fn(),
    );
    await controllers.navComparison(
      {
        userId: "user-id",
        params: { groupId: "group-id", indexId: "index-id" },
      },
      navRes,
      jest.fn(),
    );

    expect(default_XirrComparison).toHaveBeenCalledWith(
      "group-id",
      "user-id",
      "index-id",
    );
    expect(default_NavComparison).toHaveBeenCalledWith({
      indexId: "index-id",
      groupId: "group-id",
      userId: "user-id",
      startDate: new Date("2024-06-26T06:45:00.000+00:00"),
    });
    expect(xirrRes.status).toHaveBeenCalledWith(200);
    expect(navRes.status).toHaveBeenCalledWith(200);
  });
});
