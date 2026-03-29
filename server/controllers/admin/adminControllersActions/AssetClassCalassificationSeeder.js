const AssetClassModel = require("../../../models/AssetsData_Models/Classification_Models/AssetClass");
const AssetCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetCategory");
const AssetSubCategoryModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSubcategory");
const AssetIndexNameModel = require("../../../models/AssetsData_Models/Classification_Models/AssetIndexName");
const log = require("../../../utils/shared_Utils/console_loggers/consoleLoggers");
const customError = require("../../../utils/shared_Utils/error_Class/customError");

module.exports.AssetClassClassification_Seeder = async (classes = null) => {
  try {
    log.running("ASSETCLASS CLASSIFICATION SEEDING STARTED...");
    if (!classes) throw new customError("Classes is Missing", 400);
    for (const c of classes) {
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
    log.success("ASSETCLASS CLASSIFICATION SEEDING SUCESSFULL...");
    return {
      result: true,
      message: "AssetClass classification seeding successfull",
    };
  } catch (error) {
    throw new customError("ASSETCLASS CLASSIFICATION SEEDING FIALDED...", 500);
  }
};
