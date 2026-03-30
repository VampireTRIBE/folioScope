const mongoose = require("mongoose");
const { Schema } = mongoose;

const groupStatementSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      trim: true,
      enum: ["deposit", "withdrawal"],
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

    date: { type: Date, default: Date.now, required: true },
    amount: { type: Number, default: 0, required: true },
  },
  { timestamps: true },
);

// -------- Indexes --------
groupStatementSchema.index({ type: 1 });
groupStatementSchema.index({ portfolioGroupId: 1 });
groupStatementSchema.index({ userId: 1 });
groupStatementSchema.index({ date: 1 });

module.exports = mongoose.model("groupStatement", groupStatementSchema);
