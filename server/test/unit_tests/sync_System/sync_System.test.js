// test/unit_tests/sync_System/sync_System.test.js

jest.mock("../../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_masterAppscript", () => ({
  init_AppscriptMaster: jest.fn(),
}));

jest.mock("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/Init_masterCache", () => ({
  init_CacheMaster: jest.fn(),
}));

jest.mock("../../../sync_Scripts/sync_Portfolio/sync_Portfolio", () => ({
  sync_FillFutureNAVs: jest.fn(),
  sync_Portfolio: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_AlluserIds", () => ({
  get_AllUserIDs: jest.fn(),
}));

jest.mock("../../../utils/mongodb/aggregations/get_LastNavDatesByUser", () => ({
  get_LastNavDatesByUser: jest.fn(),
}));

jest.mock(
  "../../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/fetch_CurrentPriceScript",
  () => ({
    fetch_CurrentPrice: jest.fn(),
  }),
);

jest.mock("../../../utils/shared/console_Loggers/consoleLoggers", () => ({
  success: jest.fn(),
  error: jest.fn(),
  running: jest.fn(),
}));

const {
  init_AppscriptMaster,
} = require("../../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_masterAppscript");
const {
  init_CacheMaster,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/Init_masterCache");
const {
  sync_FillFutureNAVs,
  sync_Portfolio,
} = require("../../../sync_Scripts/sync_Portfolio/sync_Portfolio");
const {
  get_AllUserIDs,
} = require("../../../utils/mongodb/aggregations/get_AlluserIds");
const {
  get_LastNavDatesByUser,
} = require("../../../utils/mongodb/aggregations/get_LastNavDatesByUser");
const {
  fetch_CurrentPrice,
} = require("../../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/fetch_CurrentPriceScript");
const log = require("../../../utils/shared/console_Loggers/consoleLoggers");

const { systemBootup } = require("../../../sync_System/SystemBootup");
const {
  sync_AllUsersPortfolio,
} = require("../../../sync_System/sync_AllusersPortfolio");
const { sync_CurrentPrices } = require("../../../sync_System/sync_CurrentPrices");

describe("sync system jobs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(global, "setTimeout").mockImplementation(() => 1);
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    global.setTimeout.mockRestore();
    console.error.mockRestore();
  });

  test("systemBootup initializes cache/scripts and exits cleanly when no users exist", async () => {
    init_CacheMaster.mockResolvedValue({ result: true });
    init_AppscriptMaster.mockResolvedValue({ result: true });
    get_AllUserIDs.mockResolvedValue([]);
    get_LastNavDatesByUser.mockResolvedValue({});

    await systemBootup();

    expect(init_CacheMaster).toHaveBeenCalledTimes(1);
    expect(init_AppscriptMaster).toHaveBeenCalledTimes(1);
    expect(log.error).toHaveBeenCalledWith("No UserId Found...");
    expect(log.success).toHaveBeenCalledWith("BOOTSTRAP COMPLETED SUCCESSFULY");
    expect(sync_FillFutureNAVs).not.toHaveBeenCalled();
  });

  test("systemBootup fills future NAVs for every user", async () => {
    init_CacheMaster.mockResolvedValue({ result: true });
    init_AppscriptMaster.mockResolvedValue({ result: true });
    get_AllUserIDs.mockResolvedValue(["user-1"]);
    get_LastNavDatesByUser.mockResolvedValue({
      "user-1": {
        lastNavDate: new Date("2026-06-28T00:00:00.000Z"),
      },
    });
    sync_FillFutureNAVs.mockResolvedValue({ success: true });

    await systemBootup();

    expect(sync_FillFutureNAVs).toHaveBeenCalledWith(
      "user-1",
      new Date("2026-06-28T00:00:00.000Z"),
      expect.any(Date),
    );
    expect(log.success).toHaveBeenCalledWith(
      "Past Nav Update successful for all users",
    );
  });

  test("sync_AllUsersPortfolio runs NAV and portfolio sync for all users and schedules next run", async () => {
    get_AllUserIDs.mockResolvedValue(["user-1"]);
    get_LastNavDatesByUser.mockResolvedValue({
      "user-1": {
        lastNavDate: new Date("2026-06-28T00:00:00.000Z"),
      },
    });

    await sync_AllUsersPortfolio();

    expect(sync_FillFutureNAVs).toHaveBeenCalledWith(
      "user-1",
      new Date("2026-06-28T00:00:00.000Z"),
      expect.any(Date),
    );
    expect(sync_Portfolio).toHaveBeenCalledWith("user-1");
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 4 * 60 * 1000);
  });

  test("sync_CurrentPrices fetches current price and schedules next run", async () => {
    fetch_CurrentPrice.mockResolvedValue(undefined);

    await sync_CurrentPrices();

    expect(fetch_CurrentPrice).toHaveBeenCalledTimes(1);
    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 10 * 60 * 1000);
  });
});
