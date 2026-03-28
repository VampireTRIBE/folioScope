const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. AssetFundamentalMatrixSchema Model (Fundamental Raw DATA)
// 2. Modification Done by Admin only Quaterly or if any change in asset fundamentals.
// ==========================================
const AssetFundamentalMatrixSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "AssetsMetaData",
      required: true,
      index: true,
    },
    reportDate: { type: Date, required: true, default: Date.now },
    eps: { type: Number, required: true, default: 0 },
    bookValuePerShare: { type: Number, required: true, default: 0 },
    dividendPerShare: { type: Number, required: true, default: 0 },
    sharesOutstanding: { type: Number, required: true, default: 0 },
  },
  { timestamps: true },
);

AssetFundamentalMatrixSchema.index({ assetId: 1, reportDate: 1 }, { unique: true });

const AssetFundamentalMetrix = mongoose.model(
  "AssetFundamentalMetrix",
  AssetFundamentalMatrixSchema,
);

// ==========================================
// Exports
// ==========================================
module.exports = AssetFundamentalMetrix;
