// test/unit_tests/sync_Portfolio/sync_Portfolio.test.js

jest.mock("mongoose", () => ({
  startSession: jest.fn(),
}));

jest.mock("../../../sync_Scripts/sync_Portfolio/fill_MissingNavs", () => ({
  fill_MissingNAVs: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_AlluserIds", () => ({
  get_AllUserIDs: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/update_AssetSnapshots", () => ({
  update_AssetSnapshots: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_LeafNodes", () => ({
  get_AllLeafNodes: jest.fn(),
}));

jest.mock(
  "../../../utils/mongodb/aggregations/update_AllGroupsSnapshot",
  () => ({
    update_AllGroupsSnapshots: jest.fn(),
  }),
);

const mongoose = require("mongoose");

const {
  sync_FillFutureNAVs,
  sync_Portfolio,
} = require("../../../sync_Scripts/sync_Portfolio/sync_Portfolio");

const {
  fill_MissingNAVs,
} = require("../../../sync_Scripts/sync_Portfolio/fill_MissingNavs");
const {
  get_AllUserIDs,
} = require("../../../utils/mongodb/aggregations/get_AlluserIds");
const {
  update_AssetSnapshots,
} = require("../../../utils/mongodb/aggregations/update_AssetSnapshots");
const {
  get_AllLeafNodes,
} = require("../../../utils/mongodb/aggregations/get_LeafNodes");
const {
  update_AllGroupsSnapshots,
} = require("../../../utils/mongodb/aggregations/update_AllGroupsSnapshot");

const createSession = () => ({
  startTransaction: jest.fn(),
  commitTransaction: jest.fn().mockResolvedValue(undefined),
  abortTransaction: jest.fn().mockResolvedValue(undefined),
  endSession: jest.fn(),
});

describe("sync_Portfolio workflow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("sync_FillFutureNAVs returns false when required args are missing", async () => {
    await expect(sync_FillFutureNAVs(null, new Date())).resolves.toEqual({
      success: false,
    });
  });

  test("sync_FillFutureNAVs commits when fill_MissingNAVs succeeds", async () => {
    const session = createSession();
    mongoose.startSession.mockResolvedValue(session);
    fill_MissingNAVs.mockResolvedValue(undefined);

    const result = await sync_FillFutureNAVs(
      "user-id",
      new Date("2026-06-28T00:00:00.000Z"),
      new Date("2026-06-29T00:00:00.000Z"),
    );

    expect(result).toEqual({ success: true });
    expect(session.startTransaction).toHaveBeenCalledTimes(1);
    expect(fill_MissingNAVs).toHaveBeenCalledWith(
      "user-id",
      session,
      new Date("2026-06-28T00:00:00.000Z"),
      new Date("2026-06-29T00:00:00.000Z"),
    );
    expect(session.commitTransaction).toHaveBeenCalledTimes(1);
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  test("sync_FillFutureNAVs aborts when fill_MissingNAVs fails", async () => {
    const session = createSession();
    mongoose.startSession.mockResolvedValue(session);
    fill_MissingNAVs.mockRejectedValue(new Error("nav failed"));

    const result = await sync_FillFutureNAVs(
      "user-id",
      new Date("2026-06-28T00:00:00.000Z"),
    );

    expect(result).toEqual({ success: false });
    expect(session.abortTransaction).toHaveBeenCalledTimes(1);
    expect(session.endSession).toHaveBeenCalledTimes(1);
  });

  test("sync_Portfolio syncs provided user portfolio snapshots", async () => {
    const session = createSession();
    mongoose.startSession.mockResolvedValue(session);
    get_AllLeafNodes.mockResolvedValue(["leaf-1"]);
    update_AssetSnapshots.mockResolvedValue({ success: true });
    update_AllGroupsSnapshots.mockResolvedValue({ success: true });

    const result = await sync_Portfolio("user-id");

    expect(result).toEqual({ success: true });
    expect(get_AllUserIDs).not.toHaveBeenCalled();
    expect(get_AllLeafNodes).toHaveBeenCalledWith("user-id", session);
    expect(update_AssetSnapshots).toHaveBeenCalledWith("user-id", session);
    expect(update_AllGroupsSnapshots).toHaveBeenCalledWith(
      ["leaf-1"],
      "user-id",
      session,
    );
    expect(session.commitTransaction).toHaveBeenCalledTimes(1);
  });

  test("sync_Portfolio loads all users when user id is not provided", async () => {
    const session = createSession();
    mongoose.startSession.mockResolvedValue(session);
    get_AllUserIDs.mockResolvedValue(["user-1"]);
    get_AllLeafNodes.mockResolvedValue(["leaf-1"]);
    update_AssetSnapshots.mockResolvedValue({ success: true });
    update_AllGroupsSnapshots.mockResolvedValue({ success: true });

    const result = await sync_Portfolio();

    expect(result).toEqual({ success: true });
    expect(get_AllUserIDs).toHaveBeenCalledTimes(1);
    expect(get_AllLeafNodes).toHaveBeenCalledWith("user-1", session);
  });
});
