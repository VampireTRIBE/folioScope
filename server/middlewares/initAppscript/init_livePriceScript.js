const {
  callAppsScript,
} = require("../../services/appsScript/appsScriptService");
const {
  getAssetMetaDataGFTickerName,
} = require("../../utils/cache/assetMetaDataCache");
const log = require("../../utils/console_loggers/consoleLoggers");
const customError = require("../../utils/errorClass/customError");
const {
  validateAssetPriceHistory,
} = require("../../utils/validations/DataInsertion_Validations/assetPriceHistoryModel");
const AssetPriceHistoryModel = require("../../models/AssetsData_Models/Metrix_Models/AssetPriceHistory");

module.exports.initLivePrice = async () => {
  try {
    const GF_ticker = getAssetMetaDataGFTickerName();
    log.running("INSERTING LIVE TICKER TO GOOGLE SHEETS STARTED...");
    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "postLiveTicker",
      GF_ticker,
    );
    log.success("INSERTING LIVE TICKER TO GOOGLE SHEETS SUCCESS...");
    return res;
  } catch (error) {
    throw new customError(error.message, 500);
  }
};

module.exports.initPastPrice = async () => {
  try {
    log.running("FETCHING PAST PRICE STARTED...");
    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getpastPrice",
    );
    log.success("FETCHING PAST PRICE SUCCESS...");
    log.running("SEEDING PAST PRICE STARTED...");
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
    log.info(`TOTAL RECORDS : ${res.length}`);
    log.info(`SUCCESSFULLY INSERTED : ${results.success.length}`);
    log.info(`FAILED : ${results.failed.length}`);
    log.info(`SKIPPED : ${results.skipped.length}`);

    return {
      summary: {
        totalRecords: res.length,
        successfullRecords: results.success.length,
        failedRecords: results.failed.length,
        skippedRecords: results.skipped.length,
      },
    };
  } catch (error) {
    throw new customError(error.message, 500);
  }
};
