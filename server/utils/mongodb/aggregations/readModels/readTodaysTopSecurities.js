const customError = require("../../../shared/error/customError");

const {
  get_AssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

const { get_52WStatsByAssetId } = require("../get_AssetsPrice");

const {
  get_AssetClassificationStructureName,
  get_AssetClassificationStructureID,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

const DEFAULT_PRICE = {
  high52W: null,
  low52W: null,
  currentPrice: null,
  todayChangePercent: null,
  distanceFrom52WHighPercent: null,
  distanceFrom52WLowPercent: null,
};

const getTopAssets = ({ assets, filterFn, sortFn, limit = 5 }) =>
  [...assets].filter(filterFn).sort(sortFn).slice(0, limit);

module.exports.readTodaysTopSecurities = async () => {
  try {
    const assetMetaDataName = get_AssetMetaDataName();

    const assetClassificationID = get_AssetClassificationStructureID();

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
        ["Other"]: { _id: otherMFId },
      },
    } = AssetClassification["MUTUAL FUND"];

    const structureIds = {
      [stockId]: {
        [stockId]: "Stocks",
        [largeCapId]: "LargeCap",
        [midCapId]: "MidCap",
        [smallCapId]: "SmallCap",
      },

      [etfId]: {
        [etfId]: "Etfs",
        [equityEtfId]: "Equity",
        [sectoralEtfId]: "Sectoral",
        [internationalEtfId]: "International",
      },

      [mutualFundId]: {
        [mutualFundId]: "Mutual Funds",
        [equityMFId]: "Equity",
        [debtMFId]: "Debt",
        [otherMFId]: "Others",
      },
    };

    const finalResult = {
      Stocks: {
        LargeCap: {
          assets: {},
        },

        MidCap: {
          assets: {},
        },

        SmallCap: {
          assets: {},
        },
      },

      Etfs: {
        Equity: {
          assets: {},
        },

        Sectoral: {
          assets: {},
        },

        International: {
          assets: {},
        },
      },

      "Mutual Funds": {
        Equity: {
          assets: {},
        },

        Debt: {
          assets: {},
        },

        Others: {
          assets: {},
        },
      },
    };

    const assetIds = [];

    for (const value of Object.values(assetMetaDataName)) {
      if (!structureIds?.[value?.assetClass]?.[value?.assetCategory]) continue;

      const assetClass = structureIds[value.assetClass][value.assetClass];
      const assetCategory = structureIds[value.assetClass][value.assetCategory];
      if (!finalResult[assetClass]?.[assetCategory]) continue;

      const assetClassID = value.assetClass.toString();
      const assetCategoryID = value.assetCategory.toString();
      const assetSubCategoryID = value.assetSubCategory.toString();

      const assetSubCategory =
        assetClassificationID?.[assetClassID]?.category?.[assetCategoryID]
          ?.subcategory?.[assetSubCategoryID]?.name;

      finalResult[assetClass][assetCategory].assets[value._id] = {
        id: value._id,
        name: value.name,
        category: assetSubCategory ?? "Others",
        price: {
          ...DEFAULT_PRICE,
        },
      };
      assetIds.push(value._id);
    }

    let bulkOps = [];
    const results = [];
    const BATCH_SIZE = 500;

    for (const assetId of assetIds) {
      bulkOps.push(get_52WStatsByAssetId(assetId, 252));

      if (bulkOps.length === BATCH_SIZE) {
        const result = await Promise.all(bulkOps);
        results.push(...result);
        bulkOps = [];
      }
    }

    if (bulkOps.length > 0) {
      const result = await Promise.all(bulkOps);
      results.push(...result);
    }

    const assetPrices = Object.assign({}, ...results);

    for (const [assetClass, categories] of Object.entries(finalResult)) {
      for (const [category, output] of Object.entries(categories)) {
        for (const [assetId, assetValue] of Object.entries(output.assets)) {
          assetValue.price = assetPrices[assetId] ?? {
            ...DEFAULT_PRICE,
          };
        }
      }
    }

    for (const [assetClass, categories] of Object.entries(finalResult)) {
      for (const [category, output] of Object.entries(categories)) {
        const assets = Object.values(output.assets);

        output.gainers = getTopAssets({
          assets,
          filterFn: ({ price: { todayChangePercent } }) =>
            todayChangePercent !== null && todayChangePercent > 0,
          sortFn: (a, b) =>
            b.price.todayChangePercent - a.price.todayChangePercent,
        });

        output.losers = getTopAssets({
          assets,
          filterFn: ({ price: { todayChangePercent } }) =>
            todayChangePercent !== null && todayChangePercent < 0,
          sortFn: (a, b) =>
            a.price.todayChangePercent - b.price.todayChangePercent,
        });

        output.near52WHigh = getTopAssets({
          assets,
          filterFn: ({ price: { distanceFrom52WHighPercent } }) =>
            distanceFrom52WHighPercent !== null &&
            distanceFrom52WHighPercent < 5,
          sortFn: (a, b) =>
            a.price.distanceFrom52WHighPercent -
            b.price.distanceFrom52WHighPercent,
        });

        output.near52WLow = getTopAssets({
          assets,
          filterFn: ({ price: { distanceFrom52WLowPercent } }) =>
            distanceFrom52WLowPercent !== null && distanceFrom52WLowPercent < 5,
          sortFn: (a, b) =>
            a.price.distanceFrom52WLowPercent -
            b.price.distanceFrom52WLowPercent,
        });
      }
    }

    for (const categories of Object.values(finalResult)) {
      for (const output of Object.values(categories)) {
        delete output.assets;
      }
    }
    
    return finalResult;
  } catch (error) {
    throw new customError(error.message || "Database Error", 503);
  }
};
