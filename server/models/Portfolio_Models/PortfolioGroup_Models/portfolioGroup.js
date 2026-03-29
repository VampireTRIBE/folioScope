const mongoose = require("mongoose");
const { Schema } = mongoose;

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
    standaloneInvestmentValue: { type: Number, default: 0 },
    standaloneCurrentValue: { type: Number, default: 0 },
    standaloneRealizedGain: { type: Number, default: 0 },
    standaloneUnrealizedGain: { type: Number, default: 0 },
    standaloneCurrentYearGain: { type: Number, default: 0 },
    standaloneCash: { type: Number, default: 0 },
    standaloneIRR: { type: Number, default: 0 },

    consolidatedInvestmentValue: { type: Number, default: 0 },
    consolidatedCurrentValue: { type: Number, default: 0 },
    consolidatedRealizedGain: { type: Number, default: 0 },
    consolidatedUnrealizedGain: { type: Number, default: 0 },
    consolidatedCurrentYearGain: { type: Number, default: 0 },
    consolidatedCash: { type: Number, default: 0 },
    consolidatedIRR: { type: Number, default: 0 },

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
    console.log(this.doc);
    return next();
  } catch (err) {
    return next(err);
  }
});

// -------- BLOCK STRUCTURAL UPDATES --------
portfolioGroupSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (update.parentId || update.level || update.path || update.userId) {
    throw new Error("Structural updates are not allowed");
  }
});

portfolioGroupSchema.pre("updateOne", function () {
  throw new Error("Direct updates not allowed");
});

portfolioGroupSchema.pre("updateMany", function () {
  throw new Error("Direct updates not allowed");
});

module.exports = mongoose.model("portfolioGroup", portfolioGroupSchema);
