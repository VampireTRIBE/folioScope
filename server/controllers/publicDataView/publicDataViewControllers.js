const mongoose = require("mongoose");
const {
  read_DefaultAssetMetadata,
} = require("../../utils/mongodb/aggregations/readModels/readDefaultAssetMetadata");
const {
  get_AssetMetaDataID,
  get_AssetMetaDataName,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

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
