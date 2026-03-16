const customError = require("../../errorClass/customError");

const { getCachedId } = require("../../cache/assetHierarchyCache");

module.exports.validateAssetMetaData = async (
  data = null,
  dataType = "id",
  validateOnly = false
) => {
  try {
    if (
      !data ||
      !data.name ||
      !data.currency ||
      !data.assetClass ||
      !data.assetCategory ||
      !data.assetSubCategory
    ) {
      throw new customError("Insufficient Data", 422);
    }

    const AssetClassModel = require("../../../models/AssetsData_Models/Classification_Models/AssetClass");
    const AssetCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetCategory");
    const AssetSubCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSubcategory");
    const AssetIndexNameModel = require("../../../models/AssetsData_Models/Classification_Models/AssetIndexName");
    const AssetSectorModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSector");
    const AssetIndustryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetIndustry");
    const AssetAMCModel = require("../../../models/AssetsData_Models/Classification_Models/AssetAMC");

    let document = { ...data };

    let assetClassID = data.assetClass;
    let assetCategoryID = data.assetCategory;
    let assetSubCategoryID = data.assetSubCategory;

    if (dataType !== "id") {
      assetClassID = await getCachedId(AssetClassModel, data.assetClass);

      if (!assetClassID) throw new customError("AssetClass Not Found", 404);

      assetCategoryID = await getCachedId(
        AssetCategoryModel,
        data.assetCategory,
        assetClassID,
        "assetClass"
      );

      if (!assetCategoryID)
        throw new customError("AssetCategory Not Found", 404);

      assetSubCategoryID = await getCachedId(
        AssetSubCategoryModel,
        data.assetSubCategory,
        assetCategoryID,
        "assetCategory"
      );

      if (!assetSubCategoryID)
        throw new customError("AssetSubCategory Not Found", 404);
    }

    document.assetClass = assetClassID;
    document.assetCategory = assetCategoryID;
    document.assetSubCategory = assetSubCategoryID;

    // STOCK
    if (
      data.assetClass === "STOCK" &&
      data.assetSector &&
      data.assetIndustry &&
      !data.assetIndexName &&
      !data.assetAMC
    ) {
      const assetSectorID = await getCachedId(
        AssetSectorModel,
        data.assetSector
      );

      const assetIndustryID = await getCachedId(
        AssetIndustryModel,
        data.assetIndustry,
        assetSectorID,
        "assetSector"
      );

      if (!assetSectorID || !assetIndustryID)
        throw new customError("Invalid Sector/Industry", 404);

      document.assetSector = assetSectorID;
      document.assetIndustry = assetIndustryID;

      return validateOnly === false ? document : true;
    }

    // MUTUAL FUND / ETF
    if (
      (data.assetClass === "MUTUAL FUND" || data.assetClass === "ETF") &&
      !data.assetSector &&
      !data.assetIndustry &&
      !data.assetIndexName &&
      data.assetAMC
    ) {
      const assetAMCID = await getCachedId(AssetAMCModel, data.assetAMC);

      if (!assetAMCID) throw new customError("AMC Not Found", 404);

      document.assetAMC = assetAMCID;

      return validateOnly === false ? document : true;
    }

    // INDEX
    if (
      data.assetClass === "INDEX" &&
      !data.assetSector &&
      !data.assetIndustry &&
      data.assetIndexName &&
      !data.assetAMC
    ) {
      const assetIndexNameID = await getCachedId(
        AssetIndexNameModel,
        data.assetIndexName,
        assetSubCategoryID,
        "assetSubCategory"
      );

      if (!assetIndexNameID)
        throw new customError("IndexName Not Found", 404);

      document.assetIndexName = assetIndexNameID;

      return validateOnly === false ? document : true;
    }

    // BOND
    if (
      data.assetClass === "BOND" &&
      !data.assetSector &&
      !data.assetIndustry &&
      !data.assetIndexName &&
      !data.assetAMC
    ) {
      return validateOnly === false ? document : true;
    }

    throw new customError("Invalid Insert", 400);
  } catch (error) {
    throw new customError(error.message, error.statuscode || 500);
  }
};