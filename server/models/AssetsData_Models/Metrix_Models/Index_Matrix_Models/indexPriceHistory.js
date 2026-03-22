const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. PriceHistory Model (Daily Prices)
// 2. Automatic Update
// ==========================================
const IndexPriceHistorySchema = new Schema(
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
      set: function (val) {
        if (val instanceof Date) {
          const d = new Date(val);
          d.setUTCHours(0, 0, 0, 0);
          return d;
        }
        const parsed = new Date(val);
        parsed.setUTCHours(0, 0, 0, 0);
        return parsed;
      },
    },
    open: { type: Number, min: 0, required: true },
    high: { type: Number, min: 0, required: true },
    low: { type: Number, min: 0, required: true },
    close: { type: Number, min: 0, required: true },
  },
  { timestamps: true },
);

IndexPriceHistorySchema.index({ assetId: 1, date: -1 }, { unique: true });

const PriceHistory = mongoose.model(
  "IndexPriceHistory",
  IndexPriceHistorySchema,
);
module.exports = PriceHistory;
