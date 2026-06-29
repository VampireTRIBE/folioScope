// test/unit_tests/admin/adminControllers.test.js

jest.mock("../../../controllers/admin/adminControllersActions/AssetClassificationSeeder", () => ({
  AssetClassification_Seeder: jest.fn(),
}));

jest.mock("../../../controllers/admin/adminControllersActions/AssetMetaDataSeeder", () => ({
  AssetMetadata_Seeder: jest.fn(),
}));

jest.mock("../../../controllers/admin/adminControllersActions/AssetPriceHistorySeeder", () => ({
  PriceHistory_Seeder: jest.fn(),
}));

jest.mock(
  "../../../init_Scripts/init_Cache/AssetsData_Models_Cache/Init_masterCache",
  () => ({
    init_CacheAssetDataStructure: jest.fn(),
    init_CacheAssetMetaData: jest.fn(),
  }),
);

jest.mock(
  "../../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/init_livePriceTicker",
  () => ({
    init_LivePriceTicker: jest.fn(),
  }),
);

jest.mock("../../../utils/mongodb/aggregations/Is_Admin", () => ({
  is_Admin: jest.fn(),
}));

const {
  AssetClassification_Seeder,
} = require("../../../controllers/admin/adminControllersActions/AssetClassificationSeeder");
const {
  AssetMetadata_Seeder,
} = require("../../../controllers/admin/adminControllersActions/AssetMetaDataSeeder");
const {
  PriceHistory_Seeder,
} = require("../../../controllers/admin/adminControllersActions/AssetPriceHistorySeeder");
const {
  init_CacheAssetDataStructure,
  init_CacheAssetMetaData,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/Init_masterCache");
const {
  init_LivePriceTicker,
} = require("../../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/init_livePriceTicker");
const { is_Admin } = require("../../../utils/mongodb/aggregations/Is_Admin");
const {
  update_Classification,
  update_AssetMetaData,
  insert_PriceHistory,
} = require("../../../controllers/admin/adminControllers");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("adminControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    is_Admin.mockResolvedValue(true);
  });

  test("update_Classification checks req.userId admin and refreshes classification cache", async () => {
    const res = createResponse();
    const next = jest.fn();

    await update_Classification({ userId: "admin-id" }, res, next);

    expect(is_Admin).toHaveBeenCalledWith("admin-id");
    expect(AssetClassification_Seeder).toHaveBeenCalledTimes(1);
    expect(init_CacheAssetDataStructure).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test("update_AssetMetaData seeds metadata, refreshes cache, and starts ticker init", async () => {
    AssetMetadata_Seeder.mockResolvedValue({
      summary: { inserted: 2 },
    });
    const res = createResponse();
    const next = jest.fn();

    await update_AssetMetaData({ userId: "admin-id" }, res, next);

    expect(is_Admin).toHaveBeenCalledWith("admin-id");
    expect(init_CacheAssetMetaData).toHaveBeenCalledTimes(1);
    expect(init_LivePriceTicker).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({
      success: "AssetMetaData Update Successful",
      summary: { inserted: 2 },
    });
  });

  test("insert_PriceHistory passes requested name to seeder", async () => {
    PriceHistory_Seeder.mockResolvedValue({
      summary: { inserted: 10 },
    });
    const res = createResponse();
    const next = jest.fn();

    await insert_PriceHistory(
      {
        userId: "admin-id",
        body: { name: "NIFTY 50" },
      },
      res,
      next,
    );

    expect(PriceHistory_Seeder).toHaveBeenCalledWith("NIFTY 50");
    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("passes admin check errors to next", async () => {
    const error = new Error("Unauthorized");
    is_Admin.mockRejectedValue(error);
    const res = createResponse();
    const next = jest.fn();

    await update_Classification({ userId: "user-id" }, res, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(AssetClassification_Seeder).not.toHaveBeenCalled();
  });
});
