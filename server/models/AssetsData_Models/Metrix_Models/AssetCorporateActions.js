const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. CorporateActionSchema Model
// 2. Modification Only Done by Admin
// ==========================================

const AssetCorporateActionSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "AssetsMetaData",
      required: true,
      index: true,
    },

    actionType: {
      type: String,
      required: true,
      enum: ["SPLIT", "BONUS", "DIVIDEND", "RIGHTS", "SPINOFF", "MERGER"],
    },
    exDate: { type: Date, required: true },
    ratioNumerator: Number,
    ratioDenominator: Number,
    dividendAmount: Number,
    description: String,
  },
  { timestamps: true },
);

AssetCorporateActionSchema.index({ assetId: 1, exDate: 1 });

module.exports = mongoose.model("AssetCorporateAction", AssetCorporateActionSchema);
