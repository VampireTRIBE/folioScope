const {
  AssetClassificationSeeder,
} = require("../../config/Database/data_Seeders/AssetClassificationSeeder");
const {
  seedAssetMetadata,
} = require("../../config/Database/data_Seeders/AssetMetaDataSeeder");

const adminControllers = {
  async updateClassification(req, res, next) {
    try {
      await AssetClassificationSeeder();
      return res.status(200).json({
        success: "Classification Update SuccessFull",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
  
  async updateAssetMetaData(req, res, next) {
    try {
      await seedAssetMetadata();
      return res.status(200).json({
        success: "AssetMetaData Update SuccessFull",
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },
};

module.exports = adminControllers;
