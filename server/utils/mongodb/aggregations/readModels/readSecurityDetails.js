const customError = require("../../../shared/error/customError");

const {
  get_SingleAssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  get_AssetClassificationStructureID,
  get_SectorClasificationStructureID,
  get_AMCClasificationStructureID,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

module.exports.readSecurityOverview = (securityId = null) => {
  try {
    if (!securityId) {
      throw new customError("Security Id Required", 400);
    }

    const securityDetail = get_SingleAssetMetaDataName(securityId);
    if (!securityDetail) {
      throw new customError("Security overview is Not Available", 404);
    }

    const ClassificationCache = get_AssetClassificationStructureID();
    const SectorClassificationCache = get_SectorClasificationStructureID();
    const amcClassificationCache = get_AMCClasificationStructureID();

    const {
      assetClass: assetClassID,
      assetCategory: assetCategoryID,
      assetSubCategory: assetSubCategoryID,
      assetIndexName: assetIndexNameID,
      assetSector: assetSectorID,
      assetIndustry: assetIndustryID,
      assetAMC: assetAMCID,
    } = securityDetail;

    const resObj = {
      id: securityDetail._id,
      name: securityDetail.name,
      overview: securityDetail.overview,
      tickerCode: securityDetail.GF_TickerCode,

      classifications: [
        {
          assetClass: assetClassID
            ? {
                id: assetClassID,
                name: ClassificationCache?.[assetClassID]?.name,
              }
            : null,
        },

        {
          assetCategory: assetCategoryID
            ? {
                id: assetCategoryID,
                name: ClassificationCache?.[assetClassID]?.category?.[
                  assetCategoryID
                ]?.name,
              }
            : null,
        },
        {
          assetSubCategory: assetSubCategoryID
            ? {
                id: assetSubCategoryID,
                name: ClassificationCache?.[assetClassID]?.category?.[
                  assetCategoryID
                ]?.subcategory?.[assetSubCategoryID]?.name,
              }
            : null,
        },

        {
          assetIndexName: assetIndexNameID
            ? {
                id: assetIndexNameID,
                name: ClassificationCache?.[assetClassID]?.category?.[
                  assetCategoryID
                ]?.subcategory?.[assetSubCategoryID]?.indexName?.[
                  assetIndexNameID
                ]?.name,
              }
            : null,
        },

        {
          assetSector: assetSectorID
            ? {
                id: assetSectorID,
                name: SectorClassificationCache?.[assetSectorID]?.name,
              }
            : null,
        },

        {
          assetIndustry: assetIndustryID
            ? {
                id: assetIndustryID,
                name: SectorClassificationCache?.[assetSectorID]?.industry?.[
                  assetIndustryID
                ]?.name,
              }
            : null,
        },

        {
          assetAMC: assetAMCID
            ? {
                id: assetAMCID,
                name: amcClassificationCache?.[assetAMCID]?.name,
              }
            : null,
        },
      ],
    };

    return resObj;
  } catch (error) {
    throw error instanceof customError
      ? error
      : new customError(error.message || "Database Error", 503);
  }
};
