const mongoose = require("mongoose");

const AssetPriceHistory = mongoose.model("AssetPriceHistory");

const START_DATE = new Date("2022-01-01T00:00:00.000Z");
const PRICE_DECIMALS = 8;

/**
 * Converts a number or numeric string into a finite number.
 */
const parsePrice = ({ value, fieldName, recordId }) => {
  if (value === null || value === undefined) {
    return value;
  }

  const normalizedValue =
    typeof value === "string" ? value.replace(/,/g, "").trim() : value;

  if (normalizedValue === "") {
    return null;
  }

  const numericValue = Number(normalizedValue);

  if (!Number.isFinite(numericValue)) {
    throw new Error(
      `Invalid ${fieldName} price "${value}" in price-history record ${recordId}`,
    );
  }

  if (numericValue < 0) {
    throw new Error(
      `${fieldName} cannot be negative in price-history record ${recordId}`,
    );
  }

  return numericValue;
};

/**
 * Avoids floating-point noise such as:
 * 100 * 1.5 = 150.00000000002
 */
const roundPrice = (value) => {
  if (value === null || value === undefined) {
    return value;
  }

  return Number(value.toFixed(PRICE_DECIMALS));
};

/**
 * Reverses corporate-action-adjusted prices.
 *
 * Example:
 * Adjusted price = 100
 * Ratio = 1.5
 * Reversed price = 150
 *
 * @param {string|mongoose.Types.ObjectId} assetId
 * @param {number|string} ratio
 * @param {mongoose.ClientSession|null} session
 * @param {boolean} dryRun
 */
const reverseCorporateActionPriceAdjustment = async (
  assetId,
  ratio,
  session = null,
  dryRun = false,
) => {
  if (!mongoose.Types.ObjectId.isValid(assetId)) {
    throw new Error("Invalid assetId");
  }

  const numericRatio = Number(ratio);

  if (!Number.isFinite(numericRatio) || numericRatio <= 0) {
    throw new Error("Ratio must be a valid number greater than zero");
  }

  const objectAssetId = new mongoose.Types.ObjectId(assetId);
  const endDate = new Date("2026-07-10T06:42:33.004+00:00");

  let query = AssetPriceHistory.find({
    assetId: objectAssetId,
    date: {
      $gte: new Date("2022-01-01T00:00:00.000Z"),
      $lt: new Date("2026-02-27T00:00:00.000Z"),
    },
  })
    .select({
      _id: 1,
      date: 1,
      open: 1,
      high: 1,
      low: 1,
      close: 1,
    })
    .sort({ date: 1 })
    .lean();

  if (session) {
    query = query.session(session);
  }

  const priceRecords = await query;

  if (priceRecords.length === 0) {
    return {
      success: true,
      dryRun,
      assetId: objectAssetId.toString(),
      ratio: numericRatio,
      period: {
        startDate: START_DATE,
        endDate,
      },
      recordsFound: 0,
      recordsModified: 0,
      message: "No price-history records found for the given period",
    };
  }

  /*
   * Validate and calculate every record before writing anything.
   * This prevents a bad string value from causing a partially prepared update.
   */
  const preparedRecords = priceRecords.map((record) => {
    const recordId = record._id.toString();

    const open = parsePrice({
      value: record.open,
      fieldName: "open",
      recordId,
    });

    const high = parsePrice({
      value: record.high,
      fieldName: "high",
      recordId,
    });

    const low = parsePrice({
      value: record.low,
      fieldName: "low",
      recordId,
    });

    const close = parsePrice({
      value: record.close,
      fieldName: "close",
      recordId,
    });

    if (close === null || close === undefined) {
      throw new Error(`Close price is missing in record ${recordId}`);
    }

    return {
      _id: record._id,
      date: record.date,

      previousPrices: {
        open,
        high,
        low,
        close,
      },

      updatedPrices: {
        open:
          open === null || open === undefined
            ? open
            : roundPrice(open * numericRatio),

        high:
          high === null || high === undefined
            ? high
            : roundPrice(high * numericRatio),

        low:
          low === null || low === undefined
            ? low
            : roundPrice(low * numericRatio),

        close: roundPrice(close * numericRatio),
      },
    };
  });

  const firstRecord = preparedRecords[0];
  const lastRecord = preparedRecords[preparedRecords.length - 1];

  /*
   * dryRun=true calculates the changes but does not update MongoDB.
   */
  if (dryRun) {
    return {
      success: true,
      dryRun: true,
      assetId: objectAssetId.toString(),
      ratio: numericRatio,
      period: {
        requestedStartDate: START_DATE,
        requestedEndDate: endDate,
        firstRecordDate: firstRecord.date,
        lastRecordDate: lastRecord.date,
      },
      recordsFound: preparedRecords.length,
      recordsModified: 0,
      sample: preparedRecords.slice(0, 5),
    };
  }

  const bulkOperations = preparedRecords.map((record) => ({
    updateOne: {
      filter: {
        _id: record._id,
        assetId: objectAssetId,
      },
      update: {
        $set: record.updatedPrices,
      },
    },
  }));

  const bulkWriteOptions = {
    ordered: true,
  };

  if (session) {
    bulkWriteOptions.session = session;
  }

  const result = await AssetPriceHistory.bulkWrite(
    bulkOperations,
    bulkWriteOptions,
  );

  return {
    success: true,
    dryRun: false,
    assetId: objectAssetId.toString(),
    ratio: numericRatio,
    period: {
      requestedStartDate: START_DATE,
      requestedEndDate: endDate,
      firstRecordDate: firstRecord.date,
      lastRecordDate: lastRecord.date,
    },
    recordsFound: preparedRecords.length,
    recordsMatched: result.matchedCount,
    recordsModified: result.modifiedCount,
    sampleBefore: firstRecord.previousPrices,
    sampleAfter: firstRecord.updatedPrices,
  };
};

module.exports = {
  reverseCorporateActionPriceAdjustment,
};
