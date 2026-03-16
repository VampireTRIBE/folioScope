const mongoose = require("mongoose");
const { Schema } = mongoose;

// ==========================================
// 1. AssetSector Model (Level 1)
// ==========================================

const AssetSectorSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AssetSector", AssetSectorSchema);
