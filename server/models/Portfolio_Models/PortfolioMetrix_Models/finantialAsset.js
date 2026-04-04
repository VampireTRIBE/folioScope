const mongoose = require("mongoose");
const { Schema } = mongoose;

const snapshotSchema = new Schema(
  {
    totalQty: { type: Number, required: true, default: 0 },
    investmentValue: { type: Number, required: true, default: 0 },
    currentValue: { type: Number, required: true, default: 0 },
    realizedGain: { type: Number, required: true, default: 0 },
    dividendGain: { type: Number, required: true, default: 0 },
    STCG: { type: Number, required: true, default: 0 },
    LTCG: { type: Number, required: true, default: 0 },
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
