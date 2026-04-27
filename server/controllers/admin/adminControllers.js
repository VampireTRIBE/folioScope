const {
  AssetClassification_Seeder,
} = require("./adminControllersActions/AssetClassificationSeeder");
const {
  AssetMetadata_Seeder,
} = require("./adminControllersActions/AssetMetaDataSeeder");
const {
  PriceHistory_Seeder,
} = require("./adminControllersActions/AssetPriceHistorySeeder");

const {
  init_CacheAssetDataStructure,
  init_CacheAssetMetaData,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/Init_masterCache");
const {
  init_LivePriceTicker,
} = require("../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/init_livePriceTicker");

const { is_Admin } = require("../../utils/mongodb/aggregations/Is_Admin");

module.exports.update_Classification = async (req, res, next) => {
  try {
    const u_id = req.user._id;
    await is_Admin(u_id);
    await AssetClassification_Seeder();
    await init_CacheAssetDataStructure();
    return res.status(200).json({
      success: "Classification Seeding SuccessFull",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.update_AssetMetaData = async (req, res, next) => {
  try {
    const u_id = req.user._id;
    await is_Admin(u_id);
    const { summary } = await AssetMetadata_Seeder();
    await init_CacheAssetMetaData();
    await init_LivePriceTicker();
    return res.status(200).json({
      success: "AssetMetaData Update SuccessFull",
      summary,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.insert_PriceHistory = async (req, res, next) => {
  try {
    const u_id = req.user._id;
    const { name } = req.body;
    await is_Admin(u_id);
    const { summary } = await PriceHistory_Seeder(name);
    return res.status(200).json({
      success: "Price History Insertion is Successful",
      summary,
    });
  } catch (error) {
    next(error);
  }
};
