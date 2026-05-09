const mongoose = require("mongoose");
const customError = require("../../../shared/error/customError");
const {
  get_AssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const { get_RawPastPricesbyAssetID } = require("../get_AssetsPrice");
const {
  get_AssetClassificationStructureID,
  get_AssetClassificationStructureName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

module.exports.readTodaysTopSecurites = async () => {
  try {
    const assetMetaDataName = get_AssetMetaDataName();
    const AssetClassification = get_AssetClassificationStructureName();

    const {
      _id: stockId,
      category: {
        ["Large Cap"]: { _id: largeCapId },
        ["Mid Cap"]: { _id: midCapId },
        ["Small Cap"]: { _id: smallCapId },
      },
    } = AssetClassification["STOCK"];

    const {
      _id: etfId,
      category: {
        ["Equity ETF"]: { _id: equityEtfId },
        ["Sectoral ETF"]: { _id: sectoralEtfId },
        ["International ETF"]: { _id: internationalEtfId },
      },
    } = AssetClassification["ETF"];

    const {
      _id: mutualFundId,
      category: {
        ["Equity"]: { _id: equityMFId },
        ["Debt"]: { _id: debtMFId },
        ["Other"]: { _id: otherMDId },
      },
    } = AssetClassification["MUTUAL FUND"];

    const StructrueIds = {
      [stockId]: {
        [stockId]: "Stocks",
        [largeCapId]: "LargeCap",
        [midCapId]: "midCapId",
        [smallCapId]: "smallCapId",
      },
      [etfId]: {
        [etfId]: "Etfs",
        [equityEtfId]: "Equaty",
        [sectoralEtfId]: "Sectoral",
        [internationalEtfId]: "International",
      },
      [mutualFundId]: {
        [mutualFundId]: "Mutual Funds",
        [equityMFId]: "Equaty",
        [debtMFId]: "Debt",
        [otherMDId]: "Others",
      },
    };

    const intermediateResult = {
      Stocks: [{ LargeCap: [] }, { MidCap: [] }, { SmallCap: [] }],
      Etfs: [{ Equaty: [] }, { Sectoral: [] }, { International: [] }],
      "Mutual Funds": [{ Equaty: [] }, { Debt: [] }, { Others: [] }],
    };

    const assetIds = [];

    for (const [key, value] of Object.entries(assetMetaDataName)) {
      if (StructrueIds?.[value?.assetClass]?.[value?.assetCategory]) {
        const assetClass = StructrueIds[value.assetClass][value.assetClass];
        const assetCategory =
          StructrueIds[value.assetClass][value.assetCategory];

        for (const el of intermediateResult[assetClass]) {
          if (el?.[assetCategory]) {
            el[assetCategory].push({
              id: value._id,
              name: value.name,
              category: value.assetSubCategory,
              image: null,
              price: {
                price: null,
                today: null,
              },
            });
          }
        }
        assetIds.push(value._id);
      }
    }

    let bulkops = assetIds.map((el) => get_RawPastPricesbyAssetID(el, 2));
    const results = await Promise.all(bulkops);
    const assetPrices = Object.assign({}, ...results);

    // ! todo inserting price then sort

    return {
      assetMetaDataName,
      StructrueIds,
      assetIds,
      intermediateResult,
      assetPrices,
    };
  } catch (error) {
    console.log(error);
    throw new customError(error.message || "Database Error", 503);
  }
};
