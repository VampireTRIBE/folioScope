const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==========================================
// 1. AssetCategory Model (Level 2)
// ==========================================

const AssetCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    assetClass: {
      type: Schema.Types.ObjectId,
      ref: "AssetClass",
      required: true,
    },
  },
  { timestamps: true },
);

AssetCategorySchema.index({ name: 1, assetClass: 1 }, { unique: true });

module.exports = mongoose.model("AssetCategory", AssetCategorySchema);
