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
    irr: { type: Number, default: 0 },
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

// -------- STRUCTURE ENFORCEMENT --------
portfolioGroupSchema.pre("validate", async function (next) {
  try {
    if (this.parentId && !this.$locals.parent) {
      return next(new Error("Parent must be provided from controller"));
    }

    // ROOT
    if (!this.parentId) {
      this.level = 1;
      this.path = [];
      return next();
    }

    // Parent must be passed via $locals (Option B)
    const parent = this.$locals.parent;

    if (!parent) {
      return next(new Error("Parent must be provided"));
    }

    if (parent.userId.toString() !== this.userId.toString()) {
      return next(new Error("Parent belongs to different user"));
    }

    this.level = parent.level + 1;

    if (this.level > 4) {
      return next(new Error("Max depth exceeded"));
    }

    this.path = [...parent.path, parent._id];
    return next();
  } catch (err) {
    return next(err);
  }
});

module.exports = mongoose.model("portfolioGroup", portfolioGroupSchema);
