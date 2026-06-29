// test/unit_tests/publicDataView/publicDataViewControllers.test.js

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/readDefaultAssetMetadata",
  () => ({
    read_DefaultAssetMetadata: jest.fn(),
  }),
);

jest.mock(
  "../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache",
  () => ({
    get_AssetMetaDataID: jest.fn(),
    get_AssetMetaDataName: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/readTodaysTopSecurities",
  () => ({
    readTodaysTopSecurities: jest.fn(),
  }),
);

jest.mock(
  "../../../utils/mongodb/aggregations/readModels/readSecurityDetails",
  () => ({
    readSecurityOverview: jest.fn(),
  }),
);

jest.mock(
  "../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache",
  () => ({
    get_NAMEIDMAP: jest.fn(),
  }),
);

const {
  read_DefaultAssetMetadata,
} = require("../../../utils/mongodb/aggregations/readModels/readDefaultAssetMetadata");
const {
  get_AssetMetaDataName,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  readTodaysTopSecurities,
} = require("../../../utils/mongodb/aggregations/readModels/readTodaysTopSecurities");
const {
  readSecurityOverview,
} = require("../../../utils/mongodb/aggregations/readModels/readSecurityDetails");
const {
  get_NAMEIDMAP,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");
const controllers = require("../../../controllers/publicDataView/publicDataViewControllers");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("publicDataViewControllers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getDefaultMetadata returns default metadata read model", async () => {
    read_DefaultAssetMetadata.mockResolvedValue([{ name: "NIFTY 50" }]);
    const res = createResponse();

    await controllers.getDefaultMetadata({}, res, jest.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ name: "NIFTY 50" }],
    });
  });

  test("getAllSecuritiesList groups cache entries by asset class and tradable list", async () => {
    get_NAMEIDMAP.mockReturnValue({
      INDEX: "class-index",
      "MUTUAL FUND": "class-mf",
      ETF: "class-etf",
      BOND: "class-bond",
    });
    get_AssetMetaDataName.mockReturnValue({
      "NIFTY 50": { _id: "index-id", assetClass: "class-index" },
      "ABC MF": { _id: "mf-id", assetClass: "class-mf" },
      "XYZ ETF": { _id: "etf-id", assetClass: "class-etf" },
    });
    const res = createResponse();

    await controllers.getAllSecuritiesList({}, res, jest.fn());

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "All Securities List",
      data: {
        INDEX: { "NIFTY 50": "index-id" },
        "MUTUAL FUND": { "ABC MF": "mf-id" },
        ETF: { "XYZ ETF": "etf-id" },
        BOND: {},
        "TRADABLE SECURITIES": {
          "ABC MF": "mf-id",
          "XYZ ETF": "etf-id",
        },
      },
    });
  });

  test("getTodaysSecurities returns today top securities", async () => {
    readTodaysTopSecurities.mockResolvedValue([{ symbol: "ABC" }]);
    const res = createResponse();

    await controllers.getTodaysSecurities({}, res, jest.fn());

    expect(readTodaysTopSecurities).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ symbol: "ABC" }],
    });
  });

  test("getSecurityOverview requires securityId and otherwise delegates to overview read model", async () => {
    readSecurityOverview.mockResolvedValue({ symbol: "ABC", close: 120 });
    const res = createResponse();
    const next = jest.fn();

    await controllers.getSecurityOverview(
      { params: { securityId: "security-id" } },
      res,
      next,
    );

    expect(readSecurityOverview).toHaveBeenCalledWith("security-id");
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { symbol: "ABC", close: 120 },
    });

    const missingNext = jest.fn();
    await controllers.getSecurityOverview({ params: {} }, createResponse(), missingNext);
    expect(missingNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Security Id Required",
        statusCode: 400,
      }),
    );
  });
});
