const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. PriceHistory Model (Daily Prices)
// 2. Automatic Update
// ==========================================


const numberOrStringField = {
  type: Schema.Types.Mixed,
  validate: {
    validator: (value) =>
      value == null ||
      typeof value === "number" ||
      typeof value === "string",
    message: "Value must be a number or string",
  },
};

const AssetPriceHistorySchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "AssetsMetaData",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    open: numberOrStringField,
    high: numberOrStringField,
    low: numberOrStringField,
    close: { type: Number, min: 0, required: true },
  },
  { timestamps: true },
);

AssetPriceHistorySchema.index({ assetId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("AssetPriceHistory", AssetPriceHistorySchema);
