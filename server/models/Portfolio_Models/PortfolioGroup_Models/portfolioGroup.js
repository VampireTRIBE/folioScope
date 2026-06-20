const mongoose = require("mongoose");
const { Schema } = mongoose;

const snapshotSchema = new Schema(
  {
    investmentValue: { type: Number, default: 0 },
    currentValue: { type: Number, default: 0 },
    lifetime: {
      realizedGain: { type: Number, default: 0 },
      dividend: { type: Number, default: 0 },
    },
    financialYear: {
      startDate: { type: Date },
      realizedGain: { type: Number, default: 0 },
      dividend: { type: Number, default: 0 },
      unrealizedGain: { type: Number, default: 0 },
      totalGain: { type: Number, default: 0 },
    },
    groupXirr: {
      xirr: { type: Number, default: 0 },
      lastcomputed: { type: Date },
    },
  },
  { _id: false },
);

const portfolioGroupSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    parentId: {
      type: Schema.Types.ObjectId,
      ref: "portfolioGroup",
      default: null,
    },

    level: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    path: [
      {
        type: Schema.Types.ObjectId,
        ref: "portfolioGroup",
      },
    ],

    description: { type: String },

    // -------- Financial Fields --------
    groupSnapshot: {
      type: snapshotSchema,
      default: () => ({}),
    },
    consolidatedTax: { type: Number, default: 0 },
    consolidatedCash: { type: Number, default: 0 },
    consolidatedCurrentValue: { type: Number, default: 0 },

    // -------- Soft Delete --------
    isDeleted: {
      type: Boolean,
      default: false,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
  },
  { timestamps: true },
);

// -------- Indexes --------
portfolioGroupSchema.index(
  { name: 1, userId: 1, parentId: 1 },
  { unique: true },
);
portfolioGroupSchema.index({ parentId: 1, isDeleted: 1 });
portfolioGroupSchema.index({ parentId: 1 });
portfolioGroupSchema.index({ path: 1 });
portfolioGroupSchema.index({ userId: 1 });

// -------- AUTO FILTER (exclude deleted) --------
portfolioGroupSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
});

module.exports = mongoose.model("portfolioGroup", portfolioGroupSchema);
