const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==========================================
// 1. AssetClass Model (Level 1)
// ==========================================

const AssetClassSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["INDEX", "ETF", "MUTUAL FUND", "BOND", "STOCK"],
      unique: true,
    },
    requiredFields: [String],
    forbiddenFields: [String],
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssetClass", AssetClassSchema);
