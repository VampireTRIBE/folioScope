const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==========================================
// 1. AssetSubCategory Model (Level 3)
// ==========================================

const AssetSubCategorySchema = new Schema(
  {
    name: { type: String, required: true },
    assetCategory: {
      type: Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true,
    },
  },
  { timestamps: true },
);

AssetSubCategorySchema.index({ name: 1, assetCategory: 1 }, { unique: true });

module.exports = mongoose.model("AssetSubCategory", AssetSubCategorySchema);
