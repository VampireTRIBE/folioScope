const {
  AssetClassificationSeeder,
} = require("../../config/Database/data_Seeders/AssetClassificationSeeder");
const {
  seedAssetMetadata,
} = require("../../config/Database/data_Seeders/AssetMetaDataSeeder");
const {
  seedPriceHistory,
} = require("../../config/Database/data_Seeders/AssetPriceHistorySeeder");

const adminControllers = {
  async updateClassification(req, res, next) {
    try {
      await AssetClassificationSeeder();
      return res.status(200).json({
        success: "Classification Seeding SuccessFull",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async updateAssetMetaData(req, res, next) {
    try {
      const { summary } = await seedAssetMetadata();
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
      const { summary } = await seedPriceHistory(name);
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
