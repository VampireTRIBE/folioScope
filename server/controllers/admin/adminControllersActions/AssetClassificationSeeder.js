const mongoose = require("mongoose");
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
const log = require("../../../utils/shared_Utils/console_loggers/consoleLoggers");
const customError = require("../../../utils/shared_Utils/error_Class/customError");

module.exports.AssetClassification_Seeder = async () => {
  const session = await mongoose.startSession();
  try {
    log.running("FETCHING CLASSIFICATION FROM GOOGLE SHEETS...");

    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getClassification",
    );

    log.success("FETCH SUCCESS...");
    log.running("ASSET CLASSIFICATION SEEDING STARTED...");

    session.startTransaction();

    // =====================
    // CLASSIFICATION TREE
    // =====================
    for (const c of res.classes) {
      const cls = await AssetClassModel.findOneAndUpdate(
        { name: c.name },
        {
          name: c.name,
          requiredFields: c.requiredFields || [],
          forbiddenFields: c.forbiddenFields || [],
        },
        { new: true, upsert: true, session },
      );

      for (const cat of c.categories) {
        const category = await AssetCategoryModel.findOneAndUpdate(
          { name: cat.name, assetClass: cls._id },
          { name: cat.name, assetClass: cls._id },
          { new: true, upsert: true, session },
        );

        for (const sub of cat.subcategories) {
          const subcategory = await AssetSubCategoryModel.findOneAndUpdate(
            { name: sub, assetCategory: category._id },
            { name: sub, assetCategory: category._id },
            { new: true, upsert: true, session },
          );

          if (
            c.name === "INDEX" &&
            cat.name === "Equity Index" &&
            cat.indexNames
          ) {
            const indexNamesForSub = cat.indexNames[sub];

            if (indexNamesForSub) {
              for (const indexName of indexNamesForSub) {
                await AssetIndexNameModel.findOneAndUpdate(
                  {
                    name: indexName,
                    assetSubCategory: subcategory._id,
                  },
                  {
                    name: indexName,
                    assetSubCategory: subcategory._id,
                  },
                  { new: true, upsert: true, session },
                );
              }
            }
          }
        }
      }
    }

    log.success("CLASSIFICATION TREE SEEDED");

    // =====================
    // SECTORS + INDUSTRIES
    // =====================
    log.running("ASSET SECTOR SEEDING STARTED...");

    for (const s of res.sectors) {
      const sector = await AssetSectorModel.findOneAndUpdate(
        { name: s.name },
        { name: s.name },
        { new: true, upsert: true, session },
      );

      for (const ind of s.industries) {
        await AssetIndustryModel.findOneAndUpdate(
          { name: ind, assetSector: sector._id },
          { name: ind, assetSector: sector._id },
          { new: true, upsert: true, session },
        );
      }
    }

    log.success("SECTOR SEEDING DONE");

    // =====================
    // AMC
    // =====================
    log.running("ASSET AMC SEEDING STARTED...");

    for (const name of res.amcs) {
      await AssetAMCModel.findOneAndUpdate(
        { name },
        { name },
        { new: true, upsert: true, session },
      );
    }

    log.success("AMC SEEDING DONE");

    // =====================
    // COMMIT
    // =====================
    await session.commitTransaction();
    session.endSession();

    log.success("ASSET CLASSIFICATION SEEDING SUCCESSFUL");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    throw new customError(
      `ASSET CLASSIFICATION SEEDING FAILED: ${error.message}`,
      500,
    );
  }
};
