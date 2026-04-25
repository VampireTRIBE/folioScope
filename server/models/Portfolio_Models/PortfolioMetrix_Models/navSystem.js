// ! Rule :
//     1. investment/withdrawl > change in units
//     2. change in currentValue > change in nav.
//     3. dividend treated as gains
//     4. tax treated as loss

const mongoose = require("mongoose");
const { Schema } = mongoose;

const navPerformenceSchema = new Schema(
  {
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

    units: { type: Number, required: true, default: 0 },
    nav: { type: Number, required: true, default: 100 },
    value: { type: Number, required: true, default: 0 },
    message: { type: String },
    date: { type: Date, required: true },
  },
  { timestamps: true },
);

// -------- Indexes --------
navPerformenceSchema.index(
  {
    portfolioGroupId: 1,
    userId: 1,
    date: 1,
  },
  { unique: true },
);
navPerformenceSchema.index({ portfolioGroupId: 1 });
navPerformenceSchema.index({ date: 1 });

module.exports = mongoose.model("navPerformence", navPerformenceSchema);
