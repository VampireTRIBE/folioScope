const log = require("../../../utils/console_loggers/consoleLoggers");
const AssetMetaDataModel = require("../../../models/AssetsData_Models/Central_Models/AssetsMetaData");
const {
  callAppsScript,
} = require("../../../services/appsScript/appsScriptService");
const {
  validateAssetMetaData,
} = require("../../../utils/validations/DataInsertion_Validations/assetMetaDataModel");
const customError = require("../../../utils/errorClass/customError");

module.exports.seedAssetMetadata = async () => {
  try {
    log.running("FETCHING ASSETMETADATA FROM GOOGLE SHEETS STARTED...");
    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getAssetMetaData",
    );
    log.success("FETCHING ASSETMETADATA FROM GOOGLE SHEETS SUCCESS...");

    log.running("ASSETMETADATA SEEDING STARTED...");
    const results = {
      success: [],
      failed: [],
      skipped: [],
    };

    for (let i = 0; i < res.length; i++) {
      const record = res[i];
      const { result, message, statusCode, data } = await validateAssetMetaData(
        record,
        "name",
      );

      if (!result) {
        results.skipped.push({
          recordIndex: i + 1,
          recordData: record,
          message,
          statusCode,
        });
        continue;
      }

      try {
        const created = await AssetMetaDataModel.create(data);
        results.success.push({
          recordIndex: i + 1,
          isin: created.isin,
          name: created.name,
          id: created._id,
          message,
          statusCode,
        });

        log.done(`✓ RECORD ${i + 1}: ${created.name} (${created.isin})`);
      } catch (error) {
        results.failed.push({
          recordIndex: i + 1,
          recordData: record,
          message: error.message || "Database Error",
          statusCode: 500,
        });
        log.error(`✗ RECORD ${i + 1}: ${error.message}`);
      }
    }

    log.info("========== SEEDING SUMMARY ==========");
    log.info(`TOTAL RECORDS : ${res.length}`);
    log.info(`SUCCESSFULL RECORDS : ${results.success.length}`);
    log.info(`FAILED RECORDS : ${results.failed.length}`);
    log.info(`SKIPPED RECORDS : ${results.skipped.length}`);

    return {
      results,
      summary: {
        totalRecords: res.length,
        successfullRecords: results.success.length,
        failedRecords: results.failed.length,
        skippedRecords: results.skipped.length,
      },
    };
  } catch (error) {
    throw new customError(error.message, 404);
  }
};
