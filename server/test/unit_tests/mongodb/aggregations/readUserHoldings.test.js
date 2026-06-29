// test/unit_tests/mongodb/aggregations/readUserHoldings.test.js

const MockObjectId = jest.fn(function ObjectId(value) {
  this.value = value;
});
MockObjectId.isValid = jest.fn(() => true);

jest.mock("mongoose", () => ({
  model: jest.fn(),
  Types: {
    ObjectId: MockObjectId,
  },
}));

jest.mock("../../../../utils/mongodb/aggregations/get_leafGroupIDsByGroup", () => ({
  get_leafGroupIDsByGroup: jest.fn(),
}));

const mongoose = require("mongoose");
const {
  get_leafGroupIDsByGroup,
} = require("../../../../utils/mongodb/aggregations/get_leafGroupIDsByGroup");
const {
  read_User_Holdings,
  read_User_Holdings_ByGroupIds,
} = require("../../../../utils/mongodb/aggregations/readModels/read_FinancialAsset_Models/read_User_Holdings");

const createThenableFindChain = (result) => {
  const chain = {
    lean: jest.fn(() => chain),
    session: jest.fn(() => chain),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return chain;
};

const createAggregateChain = (result) => ({
  session: jest.fn(() => Promise.resolve(result)),
  then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
});

describe("read_User_Holdings read model", () => {
  let financialAssetModel;
  let priceHistoryModel;
  let assetMetadataModel;
  let portfolioGroupModel;

  beforeEach(() => {
    jest.clearAllMocks();
    MockObjectId.isValid.mockReturnValue(true);

    financialAssetModel = {
      find: jest.fn(),
    };
    priceHistoryModel = {
      aggregate: jest.fn(),
    };
    assetMetadataModel = {
      find: jest.fn(),
    };
    portfolioGroupModel = {
      findOne: jest.fn(),
    };

    mongoose.model.mockImplementation((modelName) => {
      if (modelName === "financialAsset") return financialAssetModel;
      if (modelName === "AssetPriceHistory") return priceHistoryModel;
      if (modelName === "AssetMetaData") return assetMetadataModel;
      if (modelName === "portfolioGroup") return portfolioGroupModel;
      throw new Error(`Unexpected model ${modelName}`);
    });
  });

  test("read_User_Holdings_ByGroupIds calculates latest LTP, one-day gain, values, and costs", async () => {
    financialAssetModel.find.mockReturnValue(
      createThenableFindChain([
        {
          _id: "financial-asset-id",
          name: "NIFTYBEES",
          assetMetadataId: {
            toString: () => "asset-id",
          },
          snapshot: {
            totalQty: 10,
            investmentValue: 900,
          },
        },
      ]),
    );
    priceHistoryModel.aggregate.mockReturnValue(
      createAggregateChain([
        {
          _id: { toString: () => "asset-id" },
          prices: [
            { close: 120, date: new Date("2026-06-29T10:00:00.000Z") },
            { close: 100, date: new Date("2026-06-28T10:00:00.000Z") },
          ],
        },
      ]),
    );
    assetMetadataModel.find.mockReturnValue({
      select: jest.fn(() => createThenableFindChain([
        {
          _id: { toString: () => "asset-id" },
          expenseRatio: "0.50%",
        },
      ])),
    });

    const result = await read_User_Holdings_ByGroupIds({
      userId: "66f000000000000000000001",
      groupIds: ["65f000000000000000000001"],
      session: "session",
    });

    expect(financialAssetModel.find).toHaveBeenCalledWith({
      userId: expect.any(MockObjectId),
      portfolioGroupId: { $in: [expect.any(MockObjectId)] },
      status: true,
    });
    expect(result).toEqual([
      {
        _id: "financial-asset-id",
        name: "NIFTYBEES",
        ltp: {
          price: 120,
          today: "20.00%",
        },
        oneDayPrice: 200,
        oneDayPercentage: "20.00%",
        qty: 10,
        avg: 90,
        profitLoss: 300,
        profitLossPercentage: "33.33%",
        invested: 900,
        current: 1200,
        expenseRatioValue: 0.5,
      },
    ]);
  });

  test("read_User_Holdings returns stats, bucket cost, and leaf holdings for a group", async () => {
    get_leafGroupIDsByGroup.mockResolvedValue([
      "65f000000000000000000001",
      "65f000000000000000000002",
    ]);
    portfolioGroupModel.findOne.mockResolvedValue({
      groupSnapshot: {
        investmentValue: 900,
        currentValue: 1200,
        groupXirr: {
          xirr: 12.345,
          lastcomputed: new Date("2026-06-29T10:00:00.000Z"),
        },
      },
    });
    financialAssetModel.find.mockReturnValue(
      createThenableFindChain([
        {
          _id: "financial-asset-id",
          name: "NIFTYBEES",
          assetMetadataId: {
            toString: () => "asset-id",
          },
          snapshot: {
            totalQty: 10,
            investmentValue: 900,
          },
        },
      ]),
    );
    priceHistoryModel.aggregate.mockReturnValue(
      createAggregateChain([
        {
          _id: { toString: () => "asset-id" },
          prices: [{ close: 120 }, { close: 100 }],
        },
      ]),
    );
    assetMetadataModel.find.mockReturnValue({
      select: jest.fn(() => createThenableFindChain([
        {
          _id: { toString: () => "asset-id" },
          expenseRatio: "0.50%",
        },
      ])),
    });

    const result = await read_User_Holdings({
      filterObj: {
        portfolioGroupId: "65f000000000000000000099",
        userId: "66f000000000000000000001",
        status: true,
      },
    });

    expect(get_leafGroupIDsByGroup).toHaveBeenCalledWith(
      "65f000000000000000000099",
      "66f000000000000000000001",
    );
    expect(result.totalStats).toEqual({
      investedValue: 900,
      currentValue: 1200,
      todaysGain: {
        price: 200,
        today: "20.00%",
      },
      groupXirr: {
        xirr: "12.35%",
        lastcomputed: "2026-06-29T10:00:00.000Z",
      },
    });
    expect(result.buketCost).toEqual({
      totalExpenseRatio: "0.50%",
      anualCost: 6,
    });
    expect(result.userHoldings).toHaveLength(1);
  });

  test("throws when group does not belong to user", async () => {
    get_leafGroupIDsByGroup.mockResolvedValue(["65f000000000000000000001"]);
    portfolioGroupModel.findOne.mockResolvedValue(null);

    await expect(
      read_User_Holdings({
        filterObj: {
          portfolioGroupId: "65f000000000000000000099",
          userId: "66f000000000000000000001",
        },
      }),
    ).rejects.toMatchObject({
      message: "Unauthorized",
      statusCode: 401,
    });
  });
});
