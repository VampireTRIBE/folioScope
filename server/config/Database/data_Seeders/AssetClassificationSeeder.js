const mongoose = require("mongoose");
const DB_connect = require("../../connectDB");
const config = require("../rawdata/AssetClasssificationStructure");
const log = require("../../../utils/console_loggers/consoleLoggers");

const AssetClassModel = require("../../../models/AssetsData_Models/Classification_Models/AssetClass");
const AssetCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetCategory");
const AssetSubCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSubcategory");
const AssetIndexNameModel = require("../../../models/AssetsData_Models/Classification_Models/AssetIndexName");
const AssetSectorModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSector");
const AssetIndustryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetIndustry");
const AssetAMCModel = require("../../../models/AssetsData_Models/Classification_Models/AssetAMC");

async function AssetClassificationSeeder() {
  await DB_connect();
  log.running("Asset Classification Seeding Start...");

  log.running("AssetClass Seeding Start...");
  for (const c of config.classes) {
    const cls = await AssetClassModel.findOneAndUpdate(
      { name: c.name },
      { name: c.name },
      { new: true, upsert: true },
    );

    for (const cat of c.categories) {
      const category = await AssetCategoryModel.findOneAndUpdate(
        { name: cat.name, assetClass: cls._id },
        { name: cat.name, assetClass: cls._id },
        { new: true, upsert: true },
      );

      for (const sub of cat.subcategories) {
        const subcategory = await AssetSubCategoryModel.findOneAndUpdate(
          { name: sub, assetCategory: category._id },
          { name: sub, assetCategory: category._id },
          { new: true, upsert: true },
        );

        // Special handling for INDEX > Equity Index
        if (
          c.name === "INDEX" &&
          cat.name === "Equity Index" &&
          cat.indexNames
        ) {
          const indexNamesForSub = cat.indexNames[sub];
          if (indexNamesForSub) {
            for (const indexName of indexNamesForSub) {
              await AssetIndexNameModel.findOneAndUpdate(
                { name: indexName, assetSubCategory: subcategory._id },
                { name: indexName, assetSubCategory: subcategory._id },
                { new: true, upsert: true },
              );
            }
          }
        }
      }
    }
  }
  log.success("AssetClass Seeding End...");

  log.running("Sectors Seeding Start...");
  for (const s of config.sectors) {
    const sector = await AssetSectorModel.findOneAndUpdate(
      { name: s.name },
      { name: s.name },
      { new: true, upsert: true },
    );

    for (const ind of s.industries) {
      await AssetIndustryModel.findOneAndUpdate(
        { name: ind, assetSector: sector._id },
        { name: ind, assetSector: sector._id },
        { new: true, upsert: true },
      );
    }
  }
  log.success("Sectors Seeding End...");

  log.running("AMC Seeding Start...");
  for (const name of config.amcs) {
    await AssetAMCModel.findOneAndUpdate(
      { name },
      { name },
      { new: true, upsert: true },
    );
  }
  log.success("AMC Seeding End...");

  mongoose.connection.close();
  log.success("All Seeders Finished.");
}

try {
  AssetClassificationSeeder();
} catch (error) {
  log.error("Asset Classification Seeding Failed...");
}
