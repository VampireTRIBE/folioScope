const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. AssetMetrixSnapshot Model (Daily Based Financial Ratios)
// 2. Atutomatic Update
// ==========================================
const AssetMetrixSnapshotSchema = new Schema(
  {
    assetId: { type: ObjectId, ref: "AssetsMetaData", required: true },
    date: { type: Date, required: true },
    rawClose: { type: Number, required: true, min: 0 },
    adjustedClose: { type: Number, required: true, min: 0 },
    fundamentalMatrixId: { type: ObjectId, ref: "AssetFundamentalMetrix" },
    pe: { type: Number },
    pb: { type: Number },
    dividendYield: { type: Number },
    marketCap: { type: Number },
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
