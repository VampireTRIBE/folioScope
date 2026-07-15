// test/unit_tests/sync_Portfolio/fill_MissingNavs.test.js

jest.mock("mongoose", () => ({
  model: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_NavMeta", () => ({
  get_NavMeta: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_GroupIDsByUser", () => ({
  get_GroupIDsByUser: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_GroupAssetQtyMap", () => ({
  get_GroupAssetQtyMap: jest.fn(),
}));

jest.mock(
  "../../../utils/mongodb/aggregations/get_GroupWithCurrentValueMap",
  () => ({
    get_GroupWithCurrentValueMap: jest.fn(),
  }),
);

jest.mock("../../../utils/mongodb/aggregations/get_AssetsPrice", () => ({
  get_PeriodCloses: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_GroupChildrenMap", () => ({
  get_GroupChildrenMap: jest.fn(),
}));

const mongoose = require("mongoose");

const {
  calculateExternalFlowUnitUpdate,
  getSortedLeafToRoot,
  fill_MissingNAVs,
} = require("../../../sync_Scripts/sync_Portfolio/fill_MissingNavs");

const { get_NavMeta } = require("../../../utils/mongodb/aggregations/get_NavMeta");
const {
  get_GroupIDsByUser,
} = require("../../../utils/mongodb/aggregations/get_GroupIDsByUser");
const {
  get_GroupAssetQtyMap,
} = require("../../../utils/mongodb/aggregations/get_GroupAssetQtyMap");
const {
  get_GroupWithCurrentValueMap,
} = require("../../../utils/mongodb/aggregations/get_GroupWithCurrentValueMap");
const {
  get_PeriodCloses,
} = require("../../../utils/mongodb/aggregations/get_AssetsPrice");
const {
  get_GroupChildrenMap,
} = require("../../../utils/mongodb/aggregations/get_GroupChildrenMap");

describe("fill_MissingNavs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sorts groups from leaf to root", () => {
    expect(
      getSortedLeafToRoot({
        parent: ["child"],
        child: [],
      }),
    ).toEqual(["child", "parent"]);
  });

  test("throws when group hierarchy has a cycle", () => {
    expect(() =>
      getSortedLeafToRoot({
        a: ["b"],
        b: ["a"],
      }),
    ).toThrow("Cycle detected in group hierarchy");
  });

  test("requires a session", async () => {
    await expect(
      fill_MissingNAVs("user-id", null, new Date(), new Date()),
    ).rejects.toThrow("session required");
  });

  test("issues external-flow units independently at each group's own NAV", () => {
    const child = calculateExternalFlowUnitUpdate({
      currentValue: 0,
      currentUnits: 0,
      amount: 1000,
      type: "deposit",
    });
    const parent = calculateExternalFlowUnitUpdate({
      currentValue: 8000,
      currentUnits: 100,
      amount: 1000,
      type: "deposit",
    });

    expect(child).toMatchObject({
      nav: 100,
      units: 10,
      value: 1000,
    });
    expect(parent).toMatchObject({
      nav: 80,
      units: 112.5,
      value: 9000,
    });
  });

  test("creates default NAV rows when no previous NAV document exists", async () => {
    const NAV_Model = {
      bulkWrite: jest.fn().mockResolvedValue({}),
    };
    mongoose.model.mockReturnValue(NAV_Model);
    get_NavMeta.mockResolvedValue({ lastDate: null });
    get_GroupIDsByUser.mockResolvedValue(["group-1", "group-2"]);

    const result = await fill_MissingNAVs(
      "user-id",
      "session",
      new Date("2026-06-28T00:00:00.000Z"),
      new Date("2026-06-28T00:00:00.000Z"),
    );

    expect(result).toEqual({
      message: "No NAV document was found. Default NAV documents were created.",
      insertedDocuments: 2,
      updatedDocuments: 0,
    });
    expect(NAV_Model.bulkWrite).toHaveBeenCalledWith(
      [
        {
          insertOne: {
            document: expect.objectContaining({
              portfolioGroupId: "group-1",
              userId: "user-id",
              message: "default",
              date: expect.any(Date),
              nav: 100,
              units: 0,
              value: 0,
            }),
          },
        },
        {
          insertOne: {
            document: expect.objectContaining({
              portfolioGroupId: "group-2",
              userId: "user-id",
              message: "default",
              date: expect.any(Date),
              nav: 100,
              units: 0,
              value: 0,
            }),
          },
        },
      ],
      { session: "session", ordered: true },
    );
  });

  test("fills market gaps while preserving the parent's independent units", async () => {
    const writtenOperations = [];
    const NAV_Model = {
      bulkWrite: jest.fn(async (operations) => {
        writtenOperations.push(...operations);
        return {};
      }),
    };
    mongoose.model.mockReturnValue(NAV_Model);

    get_NavMeta.mockResolvedValue({
      lastDate: new Date("2026-06-27T11:30:00.000Z"),
      nullDate: [],
      nonNullDate: {
        leaf: { nav: 100, units: 2 },
        parent: { nav: 50, units: 4 },
      },
      leafGroup: ["leaf"],
    });

    get_PeriodCloses.mockResolvedValue({
      "2026-06-28T10:00:00.000Z": {
        "asset-1": 20,
      },
    });

    get_GroupAssetQtyMap.mockResolvedValue({
      leaf: {
        "asset-1": 5,
      },
    });

    get_GroupWithCurrentValueMap.mockResolvedValue({
      leaf: 100,
    });

    get_GroupChildrenMap.mockResolvedValue({
      parent: ["leaf"],
      leaf: [],
    });

    await fill_MissingNAVs(
      "user-id",
      "session",
      new Date("2026-06-28T00:00:00.000Z"),
      new Date("2026-06-28T00:00:00.000Z"),
    );

    expect(writtenOperations).toHaveLength(2);
    expect(writtenOperations[0]).toMatchObject({
      updateOne: {
        filter: {
          portfolioGroupId: "leaf",
          userId: "user-id",
          date: expect.any(Date),
        },
        update: {
          $set: {
            message: "market",
            nav: 100,
            units: 2,
            value: 200,
          },
        },
        upsert: true,
      },
    });

    expect(writtenOperations[1]).toMatchObject({
      updateOne: {
        filter: {
          portfolioGroupId: "parent",
          userId: "user-id",
          date: expect.any(Date),
        },
        update: {
          $set: {
            message: "market",
            nav: 50,
            units: 4,
            value: 200,
          },
        },
        upsert: true,
      },
    });
  });

  test("rejects a parent that has value but no independently issued units", async () => {
    const NAV_Model = {
      bulkWrite: jest.fn().mockResolvedValue({}),
    };
    mongoose.model.mockReturnValue(NAV_Model);
    get_NavMeta.mockResolvedValue({
      lastDate: new Date("2026-06-27T11:30:00.000Z"),
      nullDate: [],
      nonNullDate: {
        leaf: { nav: 100, units: 1 },
        parent: { nav: 100, units: 0 },
      },
      leafGroup: ["leaf"],
    });
    get_PeriodCloses.mockResolvedValue({
      "2026-06-28T10:00:00.000Z": {},
    });
    get_GroupAssetQtyMap.mockResolvedValue({ leaf: {} });
    get_GroupWithCurrentValueMap.mockResolvedValue({ leaf: 100 });
    get_GroupChildrenMap.mockResolvedValue({
      parent: ["leaf"],
      leaf: [],
    });

    await expect(
      fill_MissingNAVs(
        "user-id",
        "session",
        new Date("2026-06-28T00:00:00.000Z"),
        new Date("2026-06-28T00:00:00.000Z"),
      ),
    ).rejects.toThrow("has value 100 but zero units");

    expect(NAV_Model.bulkWrite).not.toHaveBeenCalled();
  });

  test("rejects a missing close price instead of writing NaN", async () => {
    const NAV_Model = {
      bulkWrite: jest.fn().mockResolvedValue({}),
    };
    mongoose.model.mockReturnValue(NAV_Model);
    get_NavMeta.mockResolvedValue({
      lastDate: new Date("2026-06-27T11:30:00.000Z"),
      nullDate: [],
      nonNullDate: {
        leaf: { nav: 100, units: 1 },
      },
      leafGroup: ["leaf"],
    });
    get_PeriodCloses.mockResolvedValue({
      "2026-06-28T10:00:00.000Z": {},
    });
    get_GroupAssetQtyMap.mockResolvedValue({
      leaf: { "asset-without-price": 2 },
    });
    get_GroupWithCurrentValueMap.mockResolvedValue({ leaf: 0 });
    get_GroupChildrenMap.mockResolvedValue({ leaf: [] });

    await expect(
      fill_MissingNAVs(
        "user-id",
        "session",
        new Date("2026-06-28T00:00:00.000Z"),
        new Date("2026-06-28T00:00:00.000Z"),
      ),
    ).rejects.toThrow("Invalid close price");

    expect(NAV_Model.bulkWrite).not.toHaveBeenCalled();
  });
});
