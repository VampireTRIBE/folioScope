const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. AssetMetrixSnapshot Model (Daily Based Financial Ratios)
// 2. Atutomatic Update
// ==========================================
const AssetMetrixSnapshotSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "AssetsMetaData",
      required: true,
      index: true,
    },
    date: { type: Date, required: true, default: Date.now, index: true },
    rawClose: { type: Number, required: true, min: 0 },
    eps: { type: Number, required: true, min: 0 },
    bookValuePerShare: { type: Number, min: 0 },
    dividendPerShare: { type: Number, min: 0 },
    sharesOutstanding: { type: Number, min: 0, max: 100 },
    expenseRatio: { type: Number, default: 0 },
  },
  { timestamps: true },
);

AssetMetrixSnapshotSchema.index({ assetId: 1, date: -1 }, { unique: true });

const AssetMetrixSnapshot = mongoose.model(
  "AssetMetrixSnapshot",
  AssetMetrixSnapshotSchema,
);

// ==========================================
// Exports
// ==========================================
module.exports = AssetMetrixSnapshot;
