const mongoose = require("mongoose");
const {
  read_DefaultAssetMetadata,
} = require("../../utils/mongodb/aggregations/readModels/readDefaultAssetMetadata");
const {
  get_AssetMetaDataID,
  get_AssetMetaDataName,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  readTodaysTopSecurities,
} = require("../../utils/mongodb/aggregations/readModels/readTodaysTopSecurities");
const {
  readSecurityOverview,
} = require("../../utils/mongodb/aggregations/readModels/readSecurityDetails");
const customError = require("../../utils/shared/error/customError");
const {
  get_NAMEIDMAP,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

module.exports.getDefaultMetadata = async (req, res, next) => {
  try {
    const data = await read_DefaultAssetMetadata();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllSecuritiesList = async (req, res, next) => {
  try {
    const allsecuritieslist = get_AssetMetaDataName();
    const data = Object.keys(allsecuritieslist);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getAllTradableSecuritiesList = async (req, res, next) => {
  try {
    const allsecuritieslist = get_AssetMetaDataName();
    const { INDEX } = get_NAMEIDMAP();
    console.log(INDEX);

    let data = {};
    for (const [key, value] of Object.entries(allsecuritieslist)) {
      if (INDEX !== value?.assetClass.toString()) {
        data[key] = value._id;
      }
    }
    res.status(200).json({
      success: true,
      message: "Tradable SecuritiesList",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getTodaysSecurities = async (req, res, next) => {
  try {
    const data = await readTodaysTopSecurities();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.getSecurityOverview = async (req, res, next) => {
  try {
    const { securityId } = req.params;
    if (!securityId) throw new customError("Security Id Required", 400);
    const data = await readSecurityOverview(securityId);
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
