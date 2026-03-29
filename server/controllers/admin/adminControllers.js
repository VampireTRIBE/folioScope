const {
  initLivePriceTicker,
} = require("../../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/init_livePriceTicker");
const {
  initCacheAssetDataStructure,
  initCacheAssetMetaData,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/Init_masterCache");
const { AssetClassClassification_Seeder } = require("./adminControllersActions/AssetClassCalassificationSeeder");
const {
  AssetClassification_Seeder,
} = require("./adminControllersActions/AssetClassificationSeeder");
const {
  AssetMetadata_Seeder,
} = require("./adminControllersActions/AssetMetaDataSeeder");
const {
  PriceHistory_Seeder,
} = require("./adminControllersActions/AssetPriceHistorySeeder");

const adminControllers = {
  async updateClassification(req, res, next) {
    try {
      await AssetClassification_Seeder();
      await initCacheAssetDataStructure();
      return res.status(200).json({
        success: "Classification Seeding SuccessFull",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async updateAssetClassClassification(req, res, next) {
    try {
      const { classes } = req.body;
      await AssetClassClassification_Seeder();
      await initCacheAssetDataStructure();
      return res.status(200).json({
        success: "Classification Seeding SuccessFull",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async updateAssetMetaData(req, res, next) {
    try {
      const { summary } = await AssetMetadata_Seeder();
      await initCacheAssetMetaData();
      await initLivePriceTicker();
      return res.status(200).json({
        success: "AssetMetaData Update SuccessFull",
        summary,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async insertPriceHistory(req, res, next) {
    try {
      const { name } = req.body;
      const { summary } = await PriceHistory_Seeder(name);
      return res.status(200).json({
        success: "Price History Insertion is Successful",
        summary,
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = adminControllers;
