const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. AdjustmentFactor Model
// 2. Automatic
// ==========================================

const AdjustmentFactorSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "AssetsMetaData",
      required: true,
      index: true,
    },
    actiondate: { type: Date, required: true, index: true },
    factor: { type: Number, required: true },
  },
  { timestamps: true },
);

AdjustmentFactorSchema.index({ assetId: 1, actiondate: 1 }, { unique: true });

module.exports = mongoose.model("AdjustmentFactor", AdjustmentFactorSchema);
