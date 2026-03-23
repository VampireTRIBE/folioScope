const log = require("../../../utils/console_loggers/consoleLoggers");

const AssetClassModel = require("../../../models/AssetsData_Models/Classification_Models/AssetClass");
const AssetCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetCategory");
const AssetSubCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSubcategory");
const AssetIndexNameModel = require("../../../models/AssetsData_Models/Classification_Models/AssetIndexName");
const AssetSectorModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSector");
const AssetIndustryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetIndustry");
const AssetAMCModel = require("../../../models/AssetsData_Models/Classification_Models/AssetAMC");
const {
  callAppsScript,
} = require("../../../services/appsScript/appsScriptService");
const customError = require("../../../utils/errorClass/customError");

module.exports.AssetClassificationSeeder = async () => {
  try {
    log.running("Fetching Classification From Google Sheets");
    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getClassification",
    );
    log.success("Fetching Classification From Google Sheets Success");
    log.running("Asset Classification Seeding Start...");
    for (const c of res.classes) {
      const cls = await AssetClassModel.findOneAndUpdate(
        { name: c.name },
        {
          name: c.name,
          requiredFields: c.requiredFields || [],
          forbiddenFields: c.forbiddenFields || [],
        },
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
    for (const s of res.sectors) {
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
    for (const name of res.amcs) {
      await AssetAMCModel.findOneAndUpdate(
        { name },
        { name },
        { new: true, upsert: true },
      );
    }
    log.success("AMC Seeding End...");
    log.success("All Seeders Finished.");
  } catch (error) {
    throw new customError(error.message, 500);
  }
};
