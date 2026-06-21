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
const { object } = require("joi");

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
    const ALLSECURITIES_LIST_DATA = get_AssetMetaDataName();
    const ASSETCLASSLIST = get_NAMEIDMAP();
    const ASSETCLASS_KEYS = Object.keys(ASSETCLASSLIST);

    let ALLSECURITIES_LIST = {};
    for (const ASSETCLASS_KEY of ASSETCLASS_KEYS) {
      ALLSECURITIES_LIST[ASSETCLASS_KEY] = {};
    }
    ALLSECURITIES_LIST["TRADABLE SECURITIES"] = {};

    for (const [SECURITY_KEY, SECRUITY_VALUE] of Object.entries(
      ALLSECURITIES_LIST_DATA,
    )) {
      if (ASSETCLASSLIST?.["INDEX"] === SECRUITY_VALUE?.assetClass.toString()) {
        ALLSECURITIES_LIST["INDEX"][SECURITY_KEY] = SECRUITY_VALUE._id;
      }
      if (
        ASSETCLASSLIST?.["MUTUAL FUND"] ===
        SECRUITY_VALUE?.assetClass.toString()
      ) {
        ALLSECURITIES_LIST["MUTUAL FUND"][SECURITY_KEY] = SECRUITY_VALUE._id;
      }
      if (ASSETCLASSLIST?.["ETF"] === SECRUITY_VALUE?.assetClass.toString()) {
        ALLSECURITIES_LIST["ETF"][SECURITY_KEY] = SECRUITY_VALUE._id;
      }
      if (ASSETCLASSLIST?.["BOND"] === SECRUITY_VALUE?.assetClass.toString()) {
        ALLSECURITIES_LIST["BOND"][SECURITY_KEY] = SECRUITY_VALUE._id;
      }
      if (ASSETCLASSLIST?.["INDEX"] === SECRUITY_VALUE?.assetClass.toString()) {
        ALLSECURITIES_LIST["INDEX"][SECURITY_KEY] = SECRUITY_VALUE._id;
      }
      if (ASSETCLASSLIST?.["INDEX"] !== SECRUITY_VALUE?.assetClass.toString()) {
        ALLSECURITIES_LIST["TRADABLE SECURITIES"][SECURITY_KEY] =
          SECRUITY_VALUE._id;
      }
    }

    res.status(200).json({
      success: true,
      message: "All Securities List",
      data: ALLSECURITIES_LIST,
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
