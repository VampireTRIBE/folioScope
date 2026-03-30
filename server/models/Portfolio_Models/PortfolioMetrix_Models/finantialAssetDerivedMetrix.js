const mongoose = require("mongoose");
const { Schema } = mongoose;

const financialAssetDerivedMetrixSchema = new Schema(
  {
    financialAssetId: {
      type: Schema.Types.ObjectId,
      ref: "financialAsset",
      required: true,
    },

    portfolioGroupId: {
      type: Schema.Types.ObjectId,
      ref: "portfolioGroup",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    realizedGain: { type: Number, default: 0 },
    unRealizedGain: { type: Number, default: 0 },
    currentYearGain: { type: Number, default: 0 },
    investmentValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    irr: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// -------- Indexes --------
financialAssetDerivedMetrixSchema.index({ financialAssetId: 1 });
financialAssetDerivedMetrixSchema.index({ portfolioGroupId: 1 });
financialAssetDerivedMetrixSchema.index({ userId: 1 });

module.exports = mongoose.model("financialAsset", financialAssetDerivedMetrixSchema);
