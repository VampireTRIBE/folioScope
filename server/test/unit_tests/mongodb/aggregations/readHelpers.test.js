// test/unit_tests/mongodb/aggregations/readHelpers.test.js

jest.mock("mongoose", () => ({
  model: jest.fn(),
  Types: {
    ObjectId: jest.fn((value) => `ObjectId(${value})`),
  },
}));

const mongoose = require("mongoose");

const {
  get_GroupCurrentValue,
} = require("../../../../utils/mongodb/aggregations/get_GroupCurrentValue");
const {
  get_GroupAssetQtyMap,
} = require("../../../../utils/mongodb/aggregations/get_GroupAssetQtyMap");
const {
  get_GroupIDsByUser,
} = require("../../../../utils/mongodb/aggregations/get_GroupIDsByUser");
const {
  get_AllLeafNodes,
} = require("../../../../utils/mongodb/aggregations/get_LeafNodes");
const {
  get_AllUserIDs,
} = require("../../../../utils/mongodb/aggregations/get_AlluserIds");
const { is_Admin } = require("../../../../utils/mongodb/aggregations/Is_Admin");

const createFindOneChain = (result) => {
  const chain = {
    select: jest.fn(() => chain),
    session: jest.fn(() => chain),
    lean: jest.fn(() => Promise.resolve(result)),
  };
  return chain;
};

const createFindChain = (result) => {
  const chain = {
    select: jest.fn(() => chain),
    session: jest.fn(() => chain),
    lean: jest.fn(() => Promise.resolve(result)),
  };
  return chain;
};

const createThenableFindChain = (result) => {
  const chain = {
    lean: jest.fn(() => chain),
    session: jest.fn(() => chain),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return chain;
};

describe("mongodb aggregation read helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("get_GroupCurrentValue returns consolidated current value", async () => {
    const query = createFindOneChain({ consolidatedCurrentValue: 12345 });
    const PortfolioGroup = {
      findOne: jest.fn(() => query),
    };
    mongoose.model.mockReturnValue(PortfolioGroup);

    const result = await get_GroupCurrentValue(
      "group-id",
      "user-id",
      "session",
    );

    expect(mongoose.model).toHaveBeenCalledWith("portfolioGroup");
    expect(PortfolioGroup.findOne).toHaveBeenCalledWith({
      _id: "group-id",
      userId: "user-id",
    });
    expect(query.select).toHaveBeenCalledWith("consolidatedCurrentValue");
    expect(query.session).toHaveBeenCalledWith("session");
    expect(result).toBe(12345);
  });

  test("get_GroupCurrentValue returns null when group does not exist", async () => {
    const query = createFindOneChain(null);
    mongoose.model.mockReturnValue({
      findOne: jest.fn(() => query),
    });

    await expect(get_GroupCurrentValue("group-id", "user-id")).resolves.toBe(
      null,
    );
  });

  test("get_GroupAssetQtyMap groups aggregate rows by group id", async () => {
    const aggregateResult = [
      {
        groupId: "group-1",
        assets: {
          "asset-1": 10,
          "asset-2": 5,
        },
      },
    ];
    const aggregateChain = {
      session: jest.fn(() => Promise.resolve(aggregateResult)),
    };
    const FinancialAsset = {
      aggregate: jest.fn(() => aggregateChain),
    };
    mongoose.model.mockReturnValue(FinancialAsset);

    const result = await get_GroupAssetQtyMap("user-id", "session");

    expect(mongoose.model).toHaveBeenCalledWith("financialAsset");
    expect(mongoose.Types.ObjectId).toHaveBeenCalledWith("user-id");
    expect(FinancialAsset.aggregate.mock.calls[0][0][0]).toEqual({
      $match: {
        userId: expect.any(Object),
        status: true,
      },
    });
    expect(aggregateChain.session).toHaveBeenCalledWith("session");
    expect(result).toEqual({
      "group-1": {
        "asset-1": 10,
        "asset-2": 5,
      },
    });
  });

  test("get_GroupIDsByUser returns ids from user groups", async () => {
    const query = createFindChain([
      {
        _id: "group-1",
      },
      {
        _id: "group-2",
      },
    ]);
    const PortfolioGroup = {
      find: jest.fn(() => query),
    };
    mongoose.model.mockReturnValue(PortfolioGroup);

    const result = await get_GroupIDsByUser({
      userId: "user-id",
      session: "session",
    });

    expect(PortfolioGroup.find).toHaveBeenCalledWith({ userId: "user-id" });
    expect(query.select).toHaveBeenCalledWith("_id");
    expect(query.session).toHaveBeenCalledWith("session");
    expect(result).toEqual(["group-1", "group-2"]);
  });

  test("get_AllLeafNodes excludes parent ids and returns leaf id strings", async () => {
    const distinctChain = {
      session: jest.fn(() => Promise.resolve(["parent-1"])),
    };
    const findChain = createFindChain([
      {
        _id: {
          toString: () => "leaf-1",
        },
      },
    ]);
    const PortfolioGroup = {
      distinct: jest.fn(() => distinctChain),
      find: jest.fn(() => findChain),
    };
    mongoose.model.mockReturnValue(PortfolioGroup);

    const result = await get_AllLeafNodes("user-id", "session");

    expect(PortfolioGroup.distinct).toHaveBeenCalledWith("parentId", {
      userId: "user-id",
      isDeleted: false,
      parentId: { $ne: null },
    });
    expect(PortfolioGroup.find).toHaveBeenCalledWith(
      {
        userId: "user-id",
        isDeleted: false,
        _id: { $nin: ["parent-1"] },
      },
      { _id: 1 },
    );
    expect(result).toEqual(["leaf-1"]);
  });

  test("get_AllUserIDs returns client user ids and applies optional session", async () => {
    const query = createThenableFindChain([
      {
        _id: {
          toString: () => "user-1",
        },
      },
    ]);
    const User = {
      find: jest.fn(() => query),
    };
    mongoose.model.mockReturnValue(User);

    const result = await get_AllUserIDs("session");

    expect(User.find).toHaveBeenCalledWith({ role: "client" }, { _id: 1 });
    expect(query.lean).toHaveBeenCalledTimes(1);
    expect(query.session).toHaveBeenCalledWith("session");
    expect(result).toEqual(["user-1"]);
  });

  test("is_Admin returns true for an admin user", async () => {
    const User = {
      findOne: jest.fn().mockResolvedValue({ _id: "admin-id" }),
    };
    mongoose.model.mockReturnValue(User);

    await expect(is_Admin("admin-id")).resolves.toBe(true);

    expect(User.findOne).toHaveBeenCalledWith({
      _id: "admin-id",
      role: "admin",
    });
  });

  test("is_Admin throws Unauthorized when user is not admin", async () => {
    const User = {
      findOne: jest.fn().mockResolvedValue(null),
    };
    mongoose.model.mockReturnValue(User);

    await expect(is_Admin("user-id")).rejects.toMatchObject({
      message: "Unauthorized",
      statusCode: 401,
    });
  });
});
