const mongoose = require("mongoose");
const { Schema } = mongoose;

const fifoLotSchema = new Schema(
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

    buyQty: { type: Number, required: true },
    remainingQty: { type: Number, required: true },
    buyPrice: { type: Number, required: true },
    buyDate: { type: Date, required: true },
  },
  { timestamps: true },
);

fifoLotSchema.index({ financialAssetId: 1, buyDate: 1 });

module.exports = mongoose.model("fifoLot", fifoLotSchema);
