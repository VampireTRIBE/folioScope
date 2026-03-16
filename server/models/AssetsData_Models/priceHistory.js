const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. PriceHistory Model (Daily Prices)
// 2. Automatic Update
// ==========================================
const PriceHistorySchema = new Schema(
  {
    assetId: { type: Schema.Types.ObjectId, ref: "AssetsMetaData", required: true },
    date: { type: Date, required: true, default: Date.now },
    open: { type: Number, min: 0, required: true },
    high: { type: Number, min: 0, required: true },
    low: { type: Number, min: 0, required: true },
    close: { type: Number, min: 0, required: true },
  },
  { timestamps: true },
);

PriceHistorySchema.index({ assetId: 1, date: 1 }, { unique: true });

const PriceHistory = mongoose.model("PriceHistory", PriceHistorySchema);
module.exports = PriceHistory;
