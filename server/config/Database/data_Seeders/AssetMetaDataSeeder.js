const log = require("../../../utils/console_loggers/consoleLoggers");
const AssetMetaDataModel = require("../../../models/AssetsData_Models/Central_Models/AssetsMetaData");
const {
  callAppsScript,
} = require("../../../services/appsScript/appsScriptService");
const {
  validateAssetMetaData,
} = require("../../../utils/validations/DataInsertion_Validations/assetMetaDataModel");

module.exports.seedAssetMetadata = async () => {
  try {
    log.running("Fetching Classification From Google Sheets");
    const res = await callAppsScript(
      process.env.APPSCRIPT_SEEDER_URL,
      process.env.APPSCRIPT_SEEDER_API_KEY,
      "getAssetMetaData",
    );
    log.success("Fetching Classification From Google Sheets Success");

    log.running("Asset Metadata Seeding Start...");
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

        log.done(`✓ Record ${i + 1}: ${created.name} (${created.isin})`);
      } catch (error) {
        results.failed.push({
          recordIndex: i + 1,
          recordData: record,
          message: error.message || "Database Error",
          statusCode: 500,
        });
        log.error(`✗ Record ${i + 1}: ${error.message}`);
      }
    }

    log.info("\n========== SEEDING SUMMARY ==========");
    log.info(`Total records: ${res.length}`);
    log.info(`Successfully inserted: ${results.success.length}`);
    log.info(`Failed: ${results.failed.length}`);
    log.info(`Skipped: ${results.skipped.length}`);

    if (results.failed.length > 0) {
      log.info("\nFailed records:");
      results.failed.forEach((f) => {
        log.info(`  Record ${f.recordData}: ${f.message}`);
      });
    }

    if (results.skipped.length > 0) {
      log.info("\nSkipped records:");
      results.skipped.forEach((s) => {
        log.info(`  Record ${s.recordData}: ${s.message}`);
      });
    }
  } catch (error) {
    log.error("Seeding failed:", error);
  }
};
