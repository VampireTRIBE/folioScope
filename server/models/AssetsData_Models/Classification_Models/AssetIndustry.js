const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==========================================
// 1. AssetSector Model (Level 2)
// ==========================================

const AssetIndustrySchema = new Schema(
  {
    name: { type: String, required: true },
    assetSector: {
      type: Schema.Types.ObjectId,
      ref: "AssetSector",
      required: true,
    },
  },
  { timestamps: true },
);

AssetIndustrySchema.index({ name: 1, assetSector: 1 }, { unique: true });

module.exports = mongoose.model("AssetIndustry", AssetIndustrySchema);
