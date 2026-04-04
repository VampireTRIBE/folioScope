const mongoose = require("mongoose");
const { Schema } = mongoose;

const ledgerStatementSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["buy", "sell", "dividend"],
    },

    financialAssetId: {
      type: Schema.Types.ObjectId,
      ref: "financialAsset",
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
    qty: { type: Number },
    price: { type: Number },
    amount: { type: Number },
    cost: Number,
    profit: Number,
    STCG: Number,
    LTCG: Number,
    dividendAmount: { type: Number },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

// -------- Indexes --------
ledgerStatementSchema.index({ type: 1 });
ledgerStatementSchema.index({ financialAssetId: 1 });
ledgerStatementSchema.index({ portfolioGroupId: 1 });
ledgerStatementSchema.index({ userId: 1 });
ledgerStatementSchema.index({ date: 1 });

module.exports = mongoose.model("ledgerStatement", ledgerStatementSchema);
