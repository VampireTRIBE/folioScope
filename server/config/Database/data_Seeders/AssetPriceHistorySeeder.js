const log = require("../../../utils/console_loggers/consoleLoggers");
const AssetPriceHistoryModel = require("../../../models/AssetsData_Models/Metrix_Models/AssetPriceHistory");
const {
  callAppsScript,
} = require("../../../services/appsScript/appsScriptService");
const {
  validateAssetPriceHistory,
} = require("../../../utils/validations/DataInsertion_Validations/assetPriceHistoryModel");
const customError = require("../../../utils/errorClass/customError");

module.exports.seedPriceHistory = async () => {
  try {
    log.running("FETCHING PRICE HISTORY FROM GOOGLE SHEETS STARTED...");
    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getPriceHistory",
    );
    log.success("FETCHING PRICE HISTORY FROM GOOGLE SHEETS SUCCESS...");

    log.running("ASSET PRICE HISTORY SEEDING STARTED...");
    const results = {
      success: [],
      failed: [],
      skipped: [],
    };

    for (let i = 0; i < res.length; i++) {
      const record = res[i];
      const { result, message, statusCode, data } =
        await validateAssetPriceHistory(record, "name");

      if (!result) {
        results.skipped.push({
          recordIndex: i + 1,
          recordDate: record.date,
          message,
          statusCode,
        });
        continue;
      }

      try {
        const created = await AssetPriceHistoryModel.create(data);
        results.success.push({
          recordIndex: i + 1,
          date: created.isin,
          name: created.name,
          id: created._id,
          message,
          statusCode,
        });
      } catch (error) {
        results.failed.push({
          recordIndex: i + 1,
          recordData: record,
          message: error.message || "Database Error",
          statusCode: 500,
        });
      }
    }

    log.info("========== SEEDING SUMMARY ==========");
    log.info(`Total records: ${res.length}`);
    log.info(`Successfully inserted: ${results.success.length}`);
    log.info(`Failed: ${results.failed.length}`);
    log.info(`Skipped: ${results.skipped.length}`);

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
    throw new customError("Internal Server Error", 404);
  }
};
