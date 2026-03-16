const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==========================================
// 1. AssetAMC Model (Level 1)
// ==========================================

const AssetAMCSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssetAMC", AssetAMCSchema);
