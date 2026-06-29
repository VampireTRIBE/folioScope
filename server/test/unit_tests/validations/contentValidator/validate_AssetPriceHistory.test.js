// test/unit_tests/validations/contentValidator/validate_AssetPriceHistory.test.js

jest.mock(
  "../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache",
  () => ({
    get_SingleAssetMetaDataID: jest.fn(),
    get_SingleAssetMetaDataName: jest.fn(),
  }),
);

const {
  validate_AssetPriceHistory,
} = require("../../../../utils/validations/contentValidator/validate_AssetPriceHistory");

const {
  get_SingleAssetMetaDataID,
  get_SingleAssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

const createValidPriceHistory = (overrides = {}) => ({
  assetId: "64f000000000000000000001",
  date: "2026-06-29T10:00:00.000Z",
  open: 100,
  high: 110,
  low: 95,
  close: 105,
  ...overrides,
});

describe("validate_AssetPriceHistory", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns validation error when assetId is missing", async () => {
    const result = await validate_AssetPriceHistory(
      createValidPriceHistory({ assetId: "" }),
    );

    expect(result).toEqual({
      result: false,
      message: "AssetName is Empty",
      statusCode: 422,
    });
  });

  test("returns validation error when a required OHLC value is missing", async () => {
    const result = await validate_AssetPriceHistory(
      createValidPriceHistory({ close: undefined }),
    );

    expect(result).toEqual({
      result: false,
      message: "Missing Field value",
      statusCode: 422,
    });
  });

  test("returns validation error when asset metadata id is invalid", async () => {
    get_SingleAssetMetaDataID.mockReturnValue(null);

    const result = await validate_AssetPriceHistory(createValidPriceHistory());

    expect(get_SingleAssetMetaDataID).toHaveBeenCalledWith(
      "64f000000000000000000001",
    );
    expect(result).toEqual({
      result: false,
      message: "AssetName is Invalid",
      statusCode: 422,
    });
  });

  test("validates id-based price history and converts date to Date", async () => {
    get_SingleAssetMetaDataID.mockReturnValue({
      _id: "64f000000000000000000001",
      name: "NIFTY 50",
    });

    const data = createValidPriceHistory();

    const result = await validate_AssetPriceHistory(data);

    expect(result.result).toBe(true);
    expect(result.data).toBe(data);
    expect(result.data.date).toBeInstanceOf(Date);
    expect(result.data.date.toISOString()).toBe("2026-06-29T10:00:00.000Z");
  });

  test("validates name-based price history and replaces assetId with metadata id", async () => {
    get_SingleAssetMetaDataName.mockReturnValue({
      _id: "64f000000000000000000099",
      name: "NIFTY 50",
    });

    const data = createValidPriceHistory({
      assetId: "NIFTY 50",
    });

    const result = await validate_AssetPriceHistory(data, "name");

    expect(get_SingleAssetMetaDataName).toHaveBeenCalledWith("NIFTY 50");
    expect(result).toMatchObject({
      result: true,
      data,
    });
    expect(result.data.assetId).toBe("64f000000000000000000099");
  });

  test("returns only result flag when validateOnly is true", async () => {
    get_SingleAssetMetaDataID.mockReturnValue({
      _id: "64f000000000000000000001",
    });

    const result = await validate_AssetPriceHistory(
      createValidPriceHistory(),
      "id",
      true,
    );

    expect(result).toEqual({
      result: true,
    });
  });

  test("throws when date is invalid", async () => {
    await expect(
      validate_AssetPriceHistory(
        createValidPriceHistory({
          date: "2026-06-29",
        }),
      ),
    ).rejects.toThrow("Invalid ISO format");
  });
});
