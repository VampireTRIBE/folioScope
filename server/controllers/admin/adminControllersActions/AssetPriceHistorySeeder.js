const AssetPriceHistoryModel = require("../../../models/AssetsData_Models/Metrix_Models/AssetPriceHistory");
const {
  callAppsScript,
} = require("../../../services/appsScript/appsScriptService");
const {
  validate_AssetPriceHistory,
} = require("../../../utils/AssetData_Models_utils/validations/validateData/assetPriceHistory_Validate");
const {
  getSingleAssetMetaDataGFTickerName,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const log = require("../../../utils/shared_Utils/console_loggers/consoleLoggers");
const customError = require("../../../utils/shared_Utils/error_Class/customError");

module.exports.PriceHistory_Seeder = async (name = null) => {
  try {
    log.running("SETTING TICKER TO GOOGLE SHEETS STARTED...");
    const GF_ticker = getSingleAssetMetaDataGFTickerName(name);
    if (!GF_ticker) {
      throw new customError("Invalid Ticker Requet", 404);
    }
    const { success } = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "postPriceHistoryTicker",
      { [name]: GF_ticker },
    );
    if (!success)
      throw new customError("SETTING TICKER TO GOOGLE SHEETS Failed...");
    log.success("SETTING TICKER TO GOOGLE SHEETS SUCCESS...");
    log.running("FETCHING PRICE HISTORY FROM GOOGLE SHEETS STARTED...");

    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getPriceHistory",
    );

    log.success("FETCHING PRICE HISTORY FROM GOOGLE SHEETS SUCCESS...");
    log.running("ASSET PRICE HISTORY SEEDING STARTED...");

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

    return { summary };
  } catch (error) {
    throw new customError(error.message || "Internal Server Error", 500);
  }
};
