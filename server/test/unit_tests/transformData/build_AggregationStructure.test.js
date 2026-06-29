// test/unit_tests/transformData/build_AggregationStructure.test.js

const {
  assetClassClassification_StructureID,
  assetSectorClassification_StructureID,
  assetAMCClassification_StructureID,
  assetMetaDataID,
  assetClassClassification_StructureName,
  assetSectorClassification_StructureName,
  assetAMCClassification_StructureName,
  assetMetaDataName,
} = require("../../../utils/transformData/build_AggregationStructure");

const {
  assetClassRows,
  sectorRows,
  amcRows,
  metadataRows,
} = require("./mock/build_AggregationStructure.mock");

describe("build_AggregationStructure", () => {
  test("builds asset class hierarchy keyed by id", async () => {
    const result = await assetClassClassification_StructureID(assetClassRows);

    expect(result["asset-class-equity-id"]).toMatchObject({
      _id: "asset-class-equity-id",
      name: "Equity",
      requiredFields: ["assetSector"],
      forbiddenFields: ["assetAMC"],
    });

    expect(
      result["asset-class-equity-id"].category["category-listed-id"]
        .subcategory["subcategory-largecap-id"].indexName["index-nifty50-id"],
    ).toEqual({
      _id: "index-nifty50-id",
      name: "NIFTY 50",
    });
  });

  test("builds asset class hierarchy keyed by name", async () => {
    const result = await assetClassClassification_StructureName(assetClassRows);

    expect(
      result.Equity.category.Listed.subcategory["Large Cap"].indexName[
        "NIFTY 50"
      ],
    ).toEqual({
      _id: "index-nifty50-id",
      name: "NIFTY 50",
    });
  });

  test("builds sector hierarchy keyed by id and name", async () => {
    await expect(
      assetSectorClassification_StructureID(sectorRows),
    ).resolves.toEqual({
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
    });

    await expect(
      assetSectorClassification_StructureName(sectorRows),
    ).resolves.toEqual({
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
    });
  });

  test("builds AMC maps keyed by id and name", async () => {
    await expect(assetAMCClassification_StructureID(amcRows)).resolves.toEqual({
      "amc-hdfc-id": {
        _id: "amc-hdfc-id",
        name: "HDFC AMC",
      },
    });

    await expect(assetAMCClassification_StructureName(amcRows)).resolves.toEqual(
      {
        "HDFC AMC": {
          _id: "amc-hdfc-id",
          name: "HDFC AMC",
        },
      },
    );
  });

  test("builds metadata maps keyed by id and name", async () => {
    await expect(assetMetaDataID(metadataRows)).resolves.toEqual({
      "asset-nifty-id": metadataRows[0],
    });

    await expect(assetMetaDataName(metadataRows)).resolves.toEqual({
      NIFTYBEES: metadataRows[0],
    });
  });
});
