const mongoose = require("mongoose");
const AssetMetaData = require("./path/to/models/AssetMetaData");
const AssetClass = require("./path/to/models/AssetClass");
const AssetCategory = require("./path/to/models/AssetCategory");
const AssetSubCategory = require("./path/to/models/AssetSubCategory");
const AssetIndexName = require("./path/to/models/AssetIndexName");
const AssetSector = require("./path/to/models/AssetSector");
const AssetIndustry = require("./path/to/models/AssetIndustry");
const AssetAMC = require("./path/to/models/AssetAMC");

// Import the exported data
const assetMetadata = require("./AssetMetadata");

async function seedAssetMetadata() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/your-db-name",
    );
    console.log("Connected to MongoDB");

    const results = {
      success: [],
      failed: [],
      skipped: [],
    };

    for (let i = 0; i < assetMetadata.length; i++) {
      const record = assetMetadata[i];
      const recordNum = i + 1;

      try {
        // Validate required fields
        if (
          !record.isin ||
          !record.name ||
          !record.currency ||
          !record.assetClass ||
          !record.assetCategory ||
          !record.assetSubCategory
        ) {
          results.skipped.push({
            record: recordNum,
            data: record,
            reason:
              "Missing required fields (isin, name, currency, assetClass, assetCategory, or assetSubCategory)",
          });
          continue;
        }

        // Find ObjectIds by name
        const assetClass = await AssetClass.findOne({
          name: record.assetClass,
        });
        if (!assetClass) {
          results.failed.push({
            record: recordNum,
            data: record,
            error: `AssetClass "${record.assetClass}" not found`,
          });
          continue;
        }

        const assetCategory = await AssetCategory.findOne({
          name: record.assetCategory,
        });
        if (!assetCategory) {
          results.failed.push({
            record: recordNum,
            data: record,
            error: `AssetCategory "${record.assetCategory}" not found`,
          });
          continue;
        }

        const assetSubCategory = await AssetSubCategory.findOne({
          name: record.assetSubCategory,
        });
        if (!assetSubCategory) {
          results.failed.push({
            record: recordNum,
            data: record,
            error: `AssetSubCategory "${record.assetSubCategory}" not found`,
          });
          continue;
        }

        // Build document with ObjectIds
        const doc = {
          isin: record.isin,
          tickerCode: {
            nse: record.tickerCode.nse || undefined,
            bse: record.tickerCode.bse || undefined,
          },
          name: record.name,
          overview: record.overview || undefined,
          currency: record.currency,
          assetClass: assetClass._id,
          assetCategory: assetCategory._id,
          assetSubCategory: assetSubCategory._id,
        };

        // Handle optional fields with ObjectId lookups
        if (record.assetIndexName) {
          const assetIndexName = await AssetIndexName.findOne({
            name: record.assetIndexName,
          });
          if (!assetIndexName) {
            results.failed.push({
              record: recordNum,
              data: record,
              error: `AssetIndexName "${record.assetIndexName}" not found`,
            });
            continue;
          }
          doc.assetIndexName = assetIndexName._id;
        }

        if (record.assetSector) {
          const assetSector = await AssetSector.findOne({
            name: record.assetSector,
          });
          if (!assetSector) {
            results.failed.push({
              record: recordNum,
              data: record,
              error: `AssetSector "${record.assetSector}" not found`,
            });
            continue;
          }
          doc.assetSector = assetSector._id;
        }

        if (record.assetIndustry) {
          const assetIndustry = await AssetIndustry.findOne({
            name: record.assetIndustry,
          });
          if (!assetIndustry) {
            results.failed.push({
              record: recordNum,
              data: record,
              error: `AssetIndustry "${record.assetIndustry}" not found`,
            });
            continue;
          }
          doc.assetIndustry = assetIndustry._id;
        }

        if (record.assetAMC) {
          const assetAMC = await AssetAMC.findOne({ name: record.assetAMC });
          if (!assetAMC) {
            results.failed.push({
              record: recordNum,
              data: record,
              error: `AssetAMC "${record.assetAMC}" not found`,
            });
            continue;
          }
          doc.assetAMC = assetAMC._id;
        }

        // Insert into database
        const created = await AssetMetaData.create(doc);
        results.success.push({
          record: recordNum,
          isin: created.isin,
          name: created.name,
          id: created._id,
        });

        console.log(`✓ Record ${recordNum}: ${created.name} (${created.isin})`);
      } catch (error) {
        results.failed.push({
          record: recordNum,
          data: record,
          error: error.message,
        });
        console.error(`✗ Record ${recordNum}: ${error.message}`);
      }
    }

    // Summary
    console.log("\n========== SEEDING SUMMARY ==========");
    console.log(`Total records: ${assetMetadata.length}`);
    console.log(`Successfully inserted: ${results.success.length}`);
    console.log(`Failed: ${results.failed.length}`);
    console.log(`Skipped: ${results.skipped.length}`);

    if (results.failed.length > 0) {
      console.log("\nFailed records:");
      results.failed.forEach((f) => {
        console.log(`  Record ${f.record}: ${f.error}`);
      });
    }

    if (results.skipped.length > 0) {
      console.log("\nSkipped records:");
      results.skipped.forEach((s) => {
        console.log(`  Record ${s.record}: ${s.reason}`);
      });
    }

    await mongoose.disconnect();
    console.log("\nDisconnected from MongoDB");
  } catch (error) {
    console.error("Seeding failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run seeder
seedAssetMetadata();
