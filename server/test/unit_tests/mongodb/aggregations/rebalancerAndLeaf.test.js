// test/unit_tests/mongodb/aggregations/rebalancerAndLeaf.test.js

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

const mongoose = require("mongoose");
const {
  get_RebalancerListByUserId,
} = require("../../../../utils/mongodb/aggregations/get_RebalancerListByuserId");
const { is_Leaf } = require("../../../../utils/mongodb/aggregations/IsLeaf");

const createThenableFindChain = (result) => {
  const chain = {
    lean: jest.fn(() => chain),
    session: jest.fn(() => chain),
    then: (resolve, reject) => Promise.resolve(result).then(resolve, reject),
  };
  return chain;
};

describe("rebalancer and leaf aggregation helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockObjectId.isValid.mockReturnValue(true);
  });

  describe("get_RebalancerListByUserId", () => {
    test("returns active rebalancer asset groups keyed by group id", async () => {
      const query = createThenableFindChain([
        {
          assets: [
            { groupId: "group-1", groupName: "Equity" },
            { groupId: "group-2", groupName: "Debt" },
          ],
        },
        {
          assets: [{ groupId: "group-1", groupName: "Equity Updated" }],
        },
      ]);
      const RebalancerModel = {
        find: jest.fn(() => query),
      };
      mongoose.model.mockReturnValue(RebalancerModel);

      const result = await get_RebalancerListByUserId("user-id", "session");

      expect(mongoose.model).toHaveBeenCalledWith("PortfolioRebalancer");
      expect(RebalancerModel.find).toHaveBeenCalledWith(
        {
          userId: expect.any(MockObjectId),
          isActive: true,
        },
        {
          assets: 1,
        },
      );
      expect(query.lean).toHaveBeenCalledTimes(1);
      expect(query.session).toHaveBeenCalledWith("session");
      expect(result).toEqual({
        "group-1": "Equity Updated",
        "group-2": "Debt",
      });
    });

    test("rejects missing and malformed user ids", async () => {
      await expect(get_RebalancerListByUserId()).rejects.toMatchObject({
        message: "Missing credentials",
        statusCode: 400,
      });

      MockObjectId.isValid.mockReturnValue(false);

      await expect(
        get_RebalancerListByUserId("bad-user-id"),
      ).rejects.toMatchObject({
        message: "Invalid user id",
        statusCode: 400,
      });
    });
  });

  describe("is_Leaf", () => {
    test("returns projected leaf metadata from aggregate pipeline", async () => {
      const aggregateChain = {
        session: jest.fn().mockResolvedValue([
          {
            userId: "user-id",
            consolidatedCash: 2500,
            path: ["root-id"],
            isLeaf: true,
          },
        ]),
      };
      const Model = {
        collection: { name: "portfolioGroups" },
        aggregate: jest.fn(() => aggregateChain),
      };

      const result = await is_Leaf(Model, "group-id", "session");

      expect(Model.aggregate).toHaveBeenCalledWith([
        {
          $match: {
            _id: expect.any(MockObjectId),
            isDeleted: false,
          },
        },
        {
          $lookup: {
            from: "portfolioGroups",
            localField: "_id",
            foreignField: "parentId",
            pipeline: [{ $match: { isDeleted: false } }, { $limit: 1 }],
            as: "children",
          },
        },
        {
          $project: {
            userId: 1,
            consolidatedCash: 1,
            path: 1,
            isLeaf: { $eq: [{ $size: "$children" }, 0] },
          },
        },
      ]);
      expect(aggregateChain.session).toHaveBeenCalledWith("session");
      expect(result).toEqual({
        userId: "user-id",
        consolidatedCash: 2500,
        path: ["root-id"],
        isLeaf: true,
      });
    });

    test("throws when the group is not found", async () => {
      const Model = {
        collection: { name: "portfolioGroups" },
        aggregate: jest.fn(() => ({
          session: jest.fn().mockResolvedValue([]),
        })),
      };

      await expect(is_Leaf(Model, "missing-group")).rejects.toMatchObject({
        message: "Group not found",
        statusCode: 404,
      });
    });
  });
});
