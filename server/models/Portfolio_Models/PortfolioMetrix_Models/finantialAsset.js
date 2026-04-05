const mongoose = require("mongoose");
const { Schema } = mongoose;

const snapshotSchema = new Schema(
  {
    // =====================
    // POSITION
    // =====================
    totalQty: { type: Number, default: 0 },
    investmentValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    // =====================
    // LIFETIME PERFORMANCE
    // =====================
    lifetime: {
      realizedGain: { type: Number, default: 0 },
      dividend: { type: Number, default: 0 },
    },
    // =====================
    // FINANCIAL YEAR PERFORMANCE
    // =====================
    financialYear: {
      startDate: { type: Date },
      realizedGain: { type: Number, default: 0 },
      dividend: { type: Number, default: 0 },
      unrealizedGain: { type: Number, default: 0 },
      totalGain: { type: Number, default: 0 },
    },
    // =====================
    // OPTIONAL (KEEP IF YOU REALLY NEED TAX)
    // =====================
    tax: {
      STCG: { type: Number, default: 0 },
      LTCG: { type: Number, default: 0 },
    },
    irr: { type: Number, default: 0 },
  },
  { _id: false },
);

const financialAssetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    assetMetadataId: {
      type: Schema.Types.ObjectId,
      ref: "AssetMetaData",
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

    snapshot: {
      type: snapshotSchema,
      default: () => ({}),
    },

    dateAdded: { type: Date, required: true },
    status: {
      type: Boolean,
      default: true,
    },
    lock: {
      isLocked: Boolean,
      lockedAt: Date,
    },
  },
  { timestamps: true },
);

// -------- Indexes --------
financialAssetSchema.index(
  { assetMetadataId: 1, portfolioGroupId: 1, userId: 1 },
  { unique: true },
);
financialAssetSchema.index({ portfolioGroupId: 1, dateAdded: 1 });
financialAssetSchema.index({ portfolioGroupId: 1 });
financialAssetSchema.index({ userId: 1 });
module.exports = mongoose.model("financialAsset", financialAssetSchema);
