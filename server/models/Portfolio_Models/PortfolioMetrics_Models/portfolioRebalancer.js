const mongoose = require("mongoose");
const { Schema } = mongoose;

// ===============================
// Sub Schema: Asset Target
// ===============================
const assetTargetSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "asset",
      required: true,
    },

    assetName: {
      type: String,
      trim: true,
    },

    groupId: {
      type: Schema.Types.ObjectId,
      ref: "portfolioGroup",
      required: true,
    },

    groupName: {
      type: String,
      trim: true,
    },

    targetWeight: {
      type: Number,
      required: true,
      min: [0, "Target weight cannot be negative"],
      max: [100, "Target weight cannot be greater than 100"],
    },

    band: {
      type: Number,
      required: true,
      min: [0, "Band cannot be negative"],
      max: [100, "Band cannot be greater than 100"],
    },

    multiplier: {
      type: Number,
      default: 1,
      min: [0, "Multiplier cannot be negative"],
    },
  },
  { _id: false },
);

// ===============================
// Sub Schema: Market Fall Rule
// ===============================
const marketFallAssetRuleSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "asset",
      required: true,
    },

    assetName: {
      type: String,
      trim: true,
    },

    multiplier: {
      type: Number,
      default: 1,
      min: [0, "Multiplier cannot be negative"],
    },

    min: {
      type: Number,
      default: 0.15,
      min: [0.15, "Minimum score cannot be negative"],
    },
  },
  { _id: false },
);

const marketFallRuleSchema = new Schema(
  {
    fallPercentage: {
      type: Number,
      required: true,
      min: [0, "Market fall percentage cannot be negative"],
      max: [100, "Market fall percentage cannot be greater than 100"],
    },

    deployPercentage: {
      type: Number,
      required: true,
      min: [0, "Deploy percentage cannot be negative"],
      max: [100, "Deploy percentage cannot be greater than 100"],
    },

    isTriggered: {
      type: Boolean,
      default: false,
    },

    shotNumber: {
      type: Number,
      max: 3,
      default: 0,
    },

    assets: {
      type: [marketFallAssetRuleSchema],
      default: [],
    },

    lastDeployed: {
      type: Date,
      default: null,
    },
  },
  { _id: false },
);

// ===============================
// Main Schema: Portfolio Rebalancer
// ===============================
const portfolioRebalancerSchema = new Schema(
  {
    portfolioGroupId: {
      type: Schema.Types.ObjectId,
      ref: "portfolioGroup",
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
      index: true,
    },

    rebalancerName: {
      type: String,
      required: true,
      trim: true,
    },

    rebalancerDescription: {
      type: String,
      trim: true,
      default: "",
    },

    assets: {
      type: [assetTargetSchema],
      default: [],
    },

    marketFallRules: {
      type: [marketFallRuleSchema],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// ===============================
// Helper: Round Number
// ===============================
const roundTwo = (value) => {
  return Math.round(Number(value || 0) * 100) / 100;
};

// ===============================
// Validation: Total Weights
// ===============================
portfolioRebalancerSchema.pre("validate", function (next) {
  const portfolioGroups = this.portfolioGroups || [];
  const totalGroupWeight = portfolioGroups.reduce((sum, group) => {
    return sum + Number(group.targetWeight || 0);
  }, 0);

  const totalAssetWeight = this.assets.reduce((sum, asset) => {
    return sum + Number(asset.targetWeight || 0);
  }, 0);

  if (portfolioGroups.length > 0 && roundTwo(totalGroupWeight) !== 100) {
    return next(
      new Error(
        `Total portfolio group target weight must be exactly 100. Current total is ${roundTwo(
          totalGroupWeight,
        )}`,
      ),
    );
  }

  if (this.assets.length > 0 && roundTwo(totalAssetWeight) !== 100) {
    return next(
      new Error(
        `Total asset target weight must be exactly 100. Current total is ${roundTwo(
          totalAssetWeight,
        )}`,
      ),
    );
  }

  next();
});

// ===============================
// Unique Index
// One user cannot create duplicate rebalancer
// for the same portfolio group
// ===============================
portfolioRebalancerSchema.index(
  {
    userId: 1,
    portfolioGroupId: 1,
  },
  {
    unique: true,
  },
);

// ===============================
// Export Model
// ===============================
module.exports = mongoose.model(
  "PortfolioRebalancer",
  portfolioRebalancerSchema,
);
