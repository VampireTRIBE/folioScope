// test/unit_tests/validations/contentValidator/validate_AssetMetadata.test.js

jest.mock(
  "../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache",
  () => ({
    get_AssetClassificationStructureID: jest.fn(),
    get_AssetClassificationStructureName: jest.fn(),
    get_SectorClasificationStructureID: jest.fn(),
    get_SectorClassificationStructureName: jest.fn(),
    get_AMCClasificationStructureID: jest.fn(),
    get_AMCClassificationStructureName: jest.fn(),
  }),
);

const {
  validate_AssetMetadata,
} = require("../../../../utils/validations/contentValidator/validate_AssetMetadata");

const classificationCache = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

const idClassification = {
  "class-equity-id": {
    _id: "class-equity-id",
    name: "Equity",
    requiredFields: ["assetSector"],
    forbiddenFields: ["assetAMC"],
    category: {
      "category-stock-id": {
        _id: "category-stock-id",
        name: "Stock",
        subcategory: {
          "subcategory-largecap-id": {
            _id: "subcategory-largecap-id",
            name: "Large Cap",
            indexName: {
              "index-nifty50-id": {
                _id: "index-nifty50-id",
                name: "NIFTY 50",
              },
            },
          },
        },
      },
    },
  },
  "class-mutualfund-id": {
    _id: "class-mutualfund-id",
    name: "Mutual Fund",
    requiredFields: ["assetAMC"],
    forbiddenFields: ["assetSector"],
    category: {
      "category-fund-id": {
        _id: "category-fund-id",
        name: "Fund",
        subcategory: {
          "subcategory-index-id": {
            _id: "subcategory-index-id",
            name: "Index Fund",
            indexName: {},
          },
        },
      },
    },
  },
};

const nameClassification = {
  Equity: {
    _id: "class-equity-id",
    name: "Equity",
    requiredFields: ["assetSector"],
    forbiddenFields: ["assetAMC"],
    category: {
      Stock: {
        _id: "category-stock-id",
        name: "Stock",
        subcategory: {
          "Large Cap": {
            _id: "subcategory-largecap-id",
            name: "Large Cap",
            indexName: {
              "NIFTY 50": {
                _id: "index-nifty50-id",
                name: "NIFTY 50",
              },
            },
          },
        },
      },
    },
  },
};

const idSectors = {
  "sector-financials-id": {
    _id: "sector-financials-id",
    name: "Financials",
    industry: {
      "industry-bank-id": {
        _id: "industry-bank-id",
        name: "Bank",
      },
    },
  },
};

const nameSectors = {
  Financials: {
    _id: "sector-financials-id",
    name: "Financials",
    industry: {
      Bank: {
        _id: "industry-bank-id",
        name: "Bank",
      },
    },
  },
};

const idAMCs = {
  "amc-hdfc-id": {
    _id: "amc-hdfc-id",
    name: "HDFC AMC",
  },
};

const createEquityPayload = (overrides = {}) => ({
  isin: "INE002A01018",
  tickerCode: {
    nse: "RELIANCE",
  },
  name: "Reliance Industries",
  currency: "INR",
  assetClass: "class-equity-id",
  assetCategory: "category-stock-id",
  assetSubCategory: "subcategory-largecap-id",
  assetIndexName: "index-nifty50-id",
  assetSector: "sector-financials-id",
  assetIndustry: "industry-bank-id",
  ...overrides,
});

describe("validate_AssetMetadata", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});

    classificationCache.get_AssetClassificationStructureID.mockReturnValue(
      idClassification,
    );
    classificationCache.get_AssetClassificationStructureName.mockReturnValue(
      nameClassification,
    );
    classificationCache.get_SectorClasificationStructureID.mockReturnValue(
      idSectors,
    );
    classificationCache.get_SectorClassificationStructureName.mockReturnValue(
      nameSectors,
    );
    classificationCache.get_AMCClasificationStructureID.mockReturnValue(idAMCs);
    classificationCache.get_AMCClassificationStructureName.mockReturnValue({
      "HDFC AMC": idAMCs["amc-hdfc-id"],
    });
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  test("returns insufficient data when payload is missing", async () => {
    await expect(validate_AssetMetadata(null)).resolves.toEqual({
      result: false,
      message: "Insufficient Data",
      statusCode: 422,
    });
  });

  test("validates id-based equity metadata and builds final document", async () => {
    const result = await validate_AssetMetadata(createEquityPayload());

    expect(result).toMatchObject({
      result: true,
      message: "Validation Complete",
      statusCode: 200,
      data: {
        name: "Reliance Industries",
        currency: "INR",
        assetClass: "class-equity-id",
        assetCategory: "category-stock-id",
        assetSubCategory: "subcategory-largecap-id",
        assetIndexName: "index-nifty50-id",
        assetSector: "sector-financials-id",
        assetIndustry: "industry-bank-id",
      },
    });
  });

  test("validates name-based metadata and converts hierarchy names to ids", async () => {
    const result = await validate_AssetMetadata(
      createEquityPayload({
        assetClass: "Equity",
        assetCategory: "Stock",
        assetSubCategory: "Large Cap",
        assetIndexName: "NIFTY 50",
        assetSector: "Financials",
        assetIndustry: "Bank",
      }),
      "name",
    );

    expect(result.data).toMatchObject({
      assetClass: "class-equity-id",
      assetCategory: "category-stock-id",
      assetSubCategory: "subcategory-largecap-id",
      assetIndexName: "index-nifty50-id",
      assetSector: "sector-financials-id",
      assetIndustry: "industry-bank-id",
    });
  });

  test("rejects invalid category hierarchy", async () => {
    const result = await validate_AssetMetadata(
      createEquityPayload({
        assetCategory: "missing-category-id",
      }),
    );

    expect(result).toEqual({
      result: false,
      message: "Invalid Asset Category",
      statusCode: 422,
    });
  });

  test("rejects missing required sector hierarchy", async () => {
    const result = await validate_AssetMetadata(
      createEquityPayload({
        assetSector: null,
      }),
    );

    expect(result).toEqual({
      result: false,
      message: "Missing Sector or Industry",
      statusCode: 422,
    });
  });

  test("rejects forbidden fields for an asset class", async () => {
    const result = await validate_AssetMetadata(
      createEquityPayload({
        assetAMC: "amc-hdfc-id",
      }),
    );

    expect(result).toEqual({
      result: false,
      message: "Forbidden assetAMC Field for class-equity-id",
      statusCode: 422,
    });
  });

  test("returns success envelope without data when validateOnly is true", async () => {
    const result = await validate_AssetMetadata(
      createEquityPayload(),
      "id",
      true,
    );

    expect(result).toEqual({
      result: true,
      message: "Validation Complete",
      statusCode: 200,
    });
  });
});
