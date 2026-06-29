// test/unit_tests/portfolio/portfolioGroupControllers.test.js

const mockPortfolioGroupConstructor = jest.fn(function PortfolioGroup(doc) {
  Object.assign(this, doc);
  this.$locals = {};
  this.save = jest.fn().mockResolvedValue(this);
});
mockPortfolioGroupConstructor.findById = jest.fn();
mockPortfolioGroupConstructor.findOneAndUpdate = jest.fn();
mockPortfolioGroupConstructor.updateMany = jest.fn();

jest.mock(
  "../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup",
  () => mockPortfolioGroupConstructor,
);

const mockFinancialAssetModel = {
  findOne: jest.fn(),
};

jest.mock(
  "../../../models/Portfolio_Models/PortfolioMetrics_Models/financialAsset",
  () => mockFinancialAssetModel,
);

const mockRebalancerModel = {
  create: jest.fn(),
  find: jest.fn(),
};

jest.mock(
  "../../../models/Portfolio_Models/PortfolioMetrics_Models/portfolioRebalancer",
  () => mockRebalancerModel,
);

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/read_FinancialAsset_Models/read_User_Holdings",
  () => ({
    read_User_Holdings: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_compute_RebalancerById",
  () => ({
    read_compute_Rebalancer: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroup_Metadata",
  () => ({
    find_validate_portfolioGroup: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/readpriceRange/priceRange",
  () => ({
    read_NetWorthRange1D: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/mongodb/aggregations/writeModels/write_Rebalancer_Model/validate_NewRebalancer",
  () => ({
    validate_NewRebalancer_ReqData: jest.fn(),
  }),
);

const {
  read_User_Holdings,
} = require("../../../utils/mongodb/aggregations/readModels/read_FinancialAsset_Models/read_User_Holdings");
const {
  read_compute_Rebalancer,
} = require("../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_compute_RebalancerById");
const {
  find_validate_portfolioGroup,
} = require("../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroup_Metadata");
const {
  read_NetWorthRange1D,
} = require("../../../utils/mongodb/aggregations/readModels/readpriceRange/priceRange");
const {
  validate_NewRebalancer_ReqData,
} = require("../../../utils/mongodb/aggregations/writeModels/write_Rebalancer_Model/validate_NewRebalancer");
const controllers = require("../../../controllers/portfolio/portfolioGroupControllers");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const chainLean = (value) => ({
  select: jest.fn(() => ({
    lean: jest.fn().mockResolvedValue(value),
  })),
});

const financialAssetChain = (value) => ({
  lean: jest.fn().mockResolvedValue(value),
});

describe("portfolioGroupControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("get_GroupMetadata returns calculated snapshot metadata", async () => {
    find_validate_portfolioGroup.mockResolvedValue({
      _id: "group-id",
      name: "Growth",
      description: "Long term",
      level: 2,
      consolidatedCurrentValue: 1200,
      consolidatedCash: 100,
      consolidatedTax: 12,
      groupSnapshot: {
        investmentValue: 1000,
        currentValue: 1250,
        financialYear: {
          realizedGain: 20,
          dividend: 5,
          unrealizedGain: 200,
          totalGain: 225,
        },
        lifetime: {
          realizedGain: 40,
          dividend: 10,
        },
      },
    });
    read_NetWorthRange1D.mockResolvedValue([{ nav: 100 }]);
    const res = createResponse();

    await controllers.get_GroupMetadata(
      { userId: "user-id", params: { pg_id: "group-id" } },
      res,
    );

    expect(find_validate_portfolioGroup).toHaveBeenCalledWith({
      filterObj: { _id: "group-id", userId: "user-id" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        data: expect.objectContaining({
          groupName: "Growth",
          currentInvestment: expect.objectContaining({
            pl: "250.00",
            "pl%": "0.25",
          }),
        }),
      }),
    );
  });

  test("fetch_UserHoldings reads active holdings for selected group", async () => {
    read_User_Holdings.mockResolvedValue([{ symbol: "ABC", qty: 3 }]);
    const res = createResponse();

    await controllers.fetch_UserHoldings(
      { userId: "user-id", body: { groupId: "group-id" } },
      res,
      jest.fn(),
    );

    expect(read_User_Holdings).toHaveBeenCalledWith({
      filterObj: {
        portfolioGroupId: "group-id",
        userId: "user-id",
        status: true,
      },
    });
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Metadata Fetched",
      data: [{ symbol: "ABC", qty: 3 }],
    });
  });

  test("createRebalancer validates request data and persists it", async () => {
    validate_NewRebalancer_ReqData.mockResolvedValue({
      userId: "user-id",
      rebalancerName: "Core",
    });
    mockRebalancerModel.create.mockResolvedValue({ _id: "reb-id" });
    const req = { userId: "user-id", body: { rebalancerName: "Core" } };
    const res = createResponse();

    await controllers.createRebalancer(req, res, jest.fn());

    expect(validate_NewRebalancer_ReqData).toHaveBeenCalledWith({
      rebalancerName: "Core",
      userId: "user-id",
    });
    expect(mockRebalancerModel.create).toHaveBeenCalledWith({
      userId: "user-id",
      rebalancerName: "Core",
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("fetchRebalancerById delegates to computed read model", async () => {
    read_compute_Rebalancer.mockResolvedValue({ _id: "reb-id", score: 90 });
    const res = createResponse();

    await controllers.fetchRebalancerById(
      {
        userId: "user-id",
        params: { rebalancerId: "reb-id" },
      },
      res,
      jest.fn(),
    );

    expect(read_compute_Rebalancer).toHaveBeenCalledWith("user-id", "reb-id");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Rebalancer Fetched",
      data: { _id: "reb-id", score: 90 },
    });
  });

  test("addGroup creates a child group when parent is valid and asset-free", async () => {
    const parent = {
      _id: "parent-id",
      userId: { toString: () => "user-id" },
      level: 2,
      path: ["root-id"],
    };
    mockPortfolioGroupConstructor.findById.mockReturnValue(chainLean(parent));
    mockFinancialAssetModel.findOne.mockReturnValue(financialAssetChain(null));
    const res = createResponse();
    const next = jest.fn();

    await controllers.addGroup(
      {
        userId: "user-id",
        params: { pg_id: "parent-id" },
        body: { name: "  Equity  ", description: "Stocks" },
      },
      res,
      next,
    );

    const createdDoc = mockPortfolioGroupConstructor.mock.instances[0];
    expect(createdDoc.name).toBe("Equity");
    expect(createdDoc.parentId).toBe("parent-id");
    expect(createdDoc.$locals.parent).toBe(parent);
    expect(createdDoc.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(next).not.toHaveBeenCalled();
  });

  test("addGroup rejects parent groups that already hold assets", async () => {
    mockPortfolioGroupConstructor.findById.mockReturnValue(
      chainLean({ userId: { toString: () => "user-id" }, level: 2, path: [] }),
    );
    mockFinancialAssetModel.findOne.mockReturnValue(
      financialAssetChain({ _id: "asset-id" }),
    );
    const next = jest.fn();

    await controllers.addGroup(
      {
        userId: "user-id",
        params: { pg_id: "parent-id" },
        body: { name: "Equity", description: "Stocks" },
      },
      createResponse(),
      next,
    );

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Group with asset cannot become parent",
        statusCode: 400,
      }),
    );
  });

  test("deleteGroup soft deletes the group and descendants", async () => {
    mockPortfolioGroupConstructor.findById.mockReturnValue(
      chainLean({
        userId: { toString: () => "user-id" },
        level: 2,
        path: ["root-id"],
      }),
    );
    mockPortfolioGroupConstructor.updateMany.mockResolvedValue({
      modifiedCount: 2,
    });
    const res = createResponse();

    await controllers.deleteGroup(
      { userId: "user-id", params: { pg_id: "group-id" } },
      res,
    );

    expect(mockPortfolioGroupConstructor.updateMany).toHaveBeenCalledWith(
      { $or: [{ _id: "group-id" }, { path: "group-id" }] },
      { $set: { isDeleted: true } },
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
