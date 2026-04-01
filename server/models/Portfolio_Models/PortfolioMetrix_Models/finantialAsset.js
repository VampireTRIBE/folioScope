const mongoose = require("mongoose");
const { Schema } = mongoose;

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

    totalQty: { type: Number, default: 0, required: true },
    buyAVG: { type: Number, default: 0, required: true },
    dateAdded: { type: Date, required: true },

    status: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// -------- Indexes --------
financialAssetSchema.index(
  { assetMetadataId: 1, portfolioGroupId: 1 },
  { unique: true },
);
financialAssetSchema.index({ portfolioGroupId: 1 });
financialAssetSchema.index({ userId: 1 });
financialAssetSchema.index({ dateAdded: 1 });
financialAssetSchema.index({ status: 1 });

module.exports = mongoose.model("financialAsset", financialAssetSchema);
