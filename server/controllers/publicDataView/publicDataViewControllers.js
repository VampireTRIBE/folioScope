const mongoose = require("mongoose");
const {
  read_DefaultAssetMetadata,
} = require("../../utils/mongodb/aggregations/readModels/readDefaultAssetMetadata");
const {
  get_AssetMetaDataID,
  get_AssetMetaDataName,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const { readTodaysTopSecurites } = require("../../utils/mongodb/aggregations/readModels/readTodaysTopSecurites");

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

module.exports.getTodaysSecurities = async (req, res, next) => {
  try {
    const data = await readTodaysTopSecurites();
    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
