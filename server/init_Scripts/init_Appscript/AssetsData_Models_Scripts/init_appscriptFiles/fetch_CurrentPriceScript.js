const AssetPriceHistoryModel = require("../../../../models/AssetsData_Models/Metrix_Models/AssetPriceHistory");
const {
  callAppsScript,
} = require("../../../../services/appsScript/appsScriptService");
const {
  validate_AssetPriceHistory,
} = require("../../../../utils/AssetData_Models_utils/validations/validateData/assetPriceHistory_Validate");
const log = require("../../../../utils/shared_Utils/console_loggers/consoleLoggers");
const customError = require("../../../../utils/shared_Utils/error_Class/customError");

module.exports.fetchCurrentPrice = async () => {
  try {
    log.running("FETCHING CURRENT PRICE STARTED...");
    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getLivePrice",
    );
    log.success("FETCHING CURRENT PRICE SUCCESS...");
    log.running("SEEDING CURRENT PRICE STARTED...");
    let summary = {
      totalRecords: res.length,
      validRecords: 0,
      skippedRecords: 0,
      matchedRecords: 0,
      updatedRecords: 0,
      insertedRecords: 0,
      unchangedRecords: 0,
    };

    let bulkOps = [];
    const BATCH_SIZE = 500;

    for (let i = 0; i < res.length; i++) {
      const record = res[i];
      const { result, data } = await validate_AssetPriceHistory(record, "name");
      if (!result) {
        summary.skippedRecords++;
        continue;
      }
      summary.validRecords++;

      bulkOps.push({
        updateOne: {
          filter: { assetId: data.assetId, date: data.date },
          update: {
            $set: {
              open: data.open,
              high: data.high,
              low: data.low,
              close: data.close,
            },
          },
          upsert: true,
        },
      });

      if (bulkOps.length === BATCH_SIZE) {
        const result = await AssetPriceHistoryModel.bulkWrite(bulkOps, {
          ordered: false,
        });
        summary.insertedRecords += result.upsertedCount;
        summary.updatedRecords += result.modifiedCount;
        summary.matchedRecords += result.matchedCount;
        bulkOps = [];
      }
    }

    if (bulkOps.length > 0) {
      const result = await AssetPriceHistoryModel.bulkWrite(bulkOps, {
        ordered: false,
      });
      summary.insertedRecords += result.upsertedCount;
      summary.updatedRecords += result.modifiedCount;
      summary.matchedRecords += result.matchedCount;
    }

    summary.unchangedRecords = summary.matchedRecords - summary.updatedRecords;

    log.info("========== SEEDING SUMMARY ==========");
    log.info(`TOTAL RECORDS : ${summary.totalRecords}`);
    log.info(`VALID RECORDS : ${summary.validRecords}`);
    log.info(`SKIPPED RECORDS : ${summary.skippedRecords}`);
    log.info(`MATCHED RECORDS : ${summary.matchedRecords}`);
    log.info(`UPDATED RECORDS: ${summary.updatedRecords}`);
    log.info(`INSERTED RECORDS: ${summary.insertedRecords}`);
    log.info(`UNCHANGED RECORDS : ${summary.unchangedRecords}`);

    return { success: true };
  } catch (error) {
    throw new customError(error.message || "Internal Server Error", 500);
  }
};
