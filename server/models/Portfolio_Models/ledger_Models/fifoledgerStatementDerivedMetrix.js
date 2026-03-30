const mongoose = require("mongoose");
const { Schema } = mongoose;

const fifoLotDerivedMetrixSchema = new Schema(
  {
    financialAssetId: {
      type: Schema.Types.ObjectId,
      ref: "financialAsset",
      required: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    realizedGain: { type: Number, default: 0 },
  },
  { timestamps: true },
);

fifoLotDerivedMetrixSchema.index({ financialAssetId: 1, buyDate: 1 });

module.exports = mongoose.model(
  "fifoLotDerivedMetrix",
  fifoLotDerivedMetrixSchema,
);
