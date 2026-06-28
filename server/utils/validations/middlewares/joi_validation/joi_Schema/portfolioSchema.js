const Joi = require("joi");

const groupStatement_joi_Schema = Joi.object({
  type: Joi.string().valid("deposit", "withdrawal", "tax").required().messages({
    "string.base": "type must be a string",
    "any.only": "Transaction must be 'deposit' or 'withdrawal' or 'tax'",
    "any.required": "type is required",
  }),

  date: Joi.string().isoDate().required().messages({
    "string.isoDate": "date must be in ISO format (YYYY-MM-DDTHH:mm:ssZ)",
    "any.required": "date is required",
  }),

  amount: Joi.number().greater(0).required().messages({
    "number.base": "amount must be a number",
    "number.greater": "amount must be greater than 0",
    "any.required": "amount is required",
  }),
});

const trade_joi_Schema = Joi.object({
  type: Joi.string().valid("buy", "sell", "dividend").required().messages({
    "string.base": "type must be a string",
    "any.only": "Transaction must be 'buy' or 'sell' or 'dividend'",
    "any.required": "type is required",
  }),

  date: Joi.string().isoDate().required().messages({
    "string.isoDate": "date must be in ISO format (YYYY-MM-DDTHH:mm:ssZ)",
    "any.required": "date is required",
  }),

  qty: Joi.number()
    .when("type", {
      is: Joi.valid("buy", "sell"),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "qty is required for buy/sell",
      "any.unknown": "qty is not allowed for dividend",
    }),

  price: Joi.number()
    .when("type", {
      is: Joi.valid("buy", "sell"),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "price is required for buy/sell",
      "any.unknown": "price is not allowed for dividend",
    }),

  dividendAmount: Joi.number()
    .when("type", {
      is: "dividend",
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .messages({
      "any.required": "dividendAmount is required for dividend",
      "any.unknown": "dividendAmount is only allowed for dividend",
    }),
});

// ===============================
// ObjectId Validation
// ===============================

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be a valid MongoDB ObjectId",
  });

// ===============================
// Helpers
// ===============================

const roundTwo = (value) => {
  return Math.round(Number(value || 0) * 100) / 100;
};

const hasDuplicateValues = (values = []) => {
  const filteredValues = values.filter(Boolean).map((value) => String(value));
  return new Set(filteredValues).size !== filteredValues.length;
};

const getAssetId = (asset) => {
  return String(asset?.assetId || asset);
};

const validateSingleCashReserveAsset = (assets, helpers) => {
  const cashReserveCount = assets.filter((asset) => asset.isCashReserve).length;

  if (cashReserveCount !== 1) {
    return helpers.error("array.singleCashReserve");
  }

  return assets;
};

// ===============================
// Cross Validation Helper
// This validates that marketFallRules assets exist inside main assets
// ===============================

const validateMarketFallAssetsAgainstMainAssets = (payload, helpers) => {
  const context = helpers.prefs.context || {};

  const mainAssets = payload.assets || context.existingAssets || [];

  const marketFallRules =
    payload.marketFallRules || context.existingMarketFallRules || [];

  if (!marketFallRules.length) {
    return payload;
  }

  if (!mainAssets.length) {
    return helpers.error("object.marketFallAssetsNeedMainAssets");
  }

  const allowedAssetIds = new Set(mainAssets.map(getAssetId));
  const cashReserveAssetIds = new Set(
    mainAssets.filter((asset) => asset?.isCashReserve).map(getAssetId),
  );

  const invalidAssetIds = [];
  const cashReserveRuleAssetIds = [];

  marketFallRules.forEach((rule) => {
    const ruleAssets = rule.assets || [];

    ruleAssets.forEach((assetRule) => {
      const assetId = String(assetRule.assetId);

      if (!allowedAssetIds.has(assetId)) {
        invalidAssetIds.push(assetId);
        return;
      }

      if (cashReserveAssetIds.has(assetId)) {
        cashReserveRuleAssetIds.push(assetId);
      }
    });
  });

  if (invalidAssetIds.length) {
    return helpers.error("object.marketFallAssetMismatch", {
      invalidAssetIds: [...new Set(invalidAssetIds)].join(", "),
    });
  }

  if (cashReserveRuleAssetIds.length) {
    return helpers.error("object.marketFallCashReserveAsset", {
      cashReserveAssetIds: [...new Set(cashReserveRuleAssetIds)].join(", "),
    });
  }

  return payload;
};

// ===============================
// Asset Target Validation Schema
// Matches assetTargetSchema
// ===============================

const assetTargetValidationSchema = Joi.object({
  assetId: objectId.required().messages({
    "any.required": "Asset id is required",
    "string.empty": "Asset id is required",
  }),

  groupId: objectId.required().messages({
    "any.required": "Group id is required",
    "string.empty": "Group id is required",
  }),

  targetWeight: Joi.number().min(0).max(100).required().messages({
    "number.base": "Target weight must be a number",
    "number.min": "Target weight cannot be negative",
    "number.max": "Target weight cannot be greater than 100",
    "any.required": "Target weight is required",
  }),

  band: Joi.number().min(0).max(100).required().messages({
    "number.base": "Band must be a number",
    "number.min": "Band cannot be negative",
    "number.max": "Band cannot be greater than 100",
    "any.required": "Band is required",
  }),

  multiplier: Joi.number().min(0).default(1).messages({
    "number.base": "Multiplier must be a number",
    "number.min": "Multiplier cannot be negative",
  }),

  isCashReserve: Joi.boolean().default(false).messages({
    "boolean.base": "Cash reserve flag must be true or false",
  }),
});

// ===============================
// Market Fall Asset Rule Validation Schema
// Matches marketFallAssetRuleSchema
// ===============================

const marketFallAssetRuleValidationSchema = Joi.object({
  assetId: objectId.required().messages({
    "any.required": "Market fall asset id is required",
    "string.empty": "Market fall asset id is required",
  }),

  multiplier: Joi.number().min(0).default(1).messages({
    "number.base": "Multiplier must be a number",
    "number.min": "Multiplier cannot be negative",
  }),

  min: Joi.number().min(0.15).default(0.15).messages({
    "number.base": "Minimum score must be a number",
    "number.min": "Minimum score must be at least 0.15",
  }),
});

// ===============================
// Market Fall Rule Validation Schema
// Matches marketFallRuleSchema
// ===============================

const marketFallRuleValidationSchema = Joi.object({
  fallPercentage: Joi.number().min(0).max(100).required().messages({
    "number.base": "Market fall percentage must be a number",
    "number.min": "Market fall percentage cannot be negative",
    "number.max": "Market fall percentage cannot be greater than 100",
    "any.required": "Market fall percentage is required",
  }),

  deployPercentage: Joi.number().min(0).max(100).required().messages({
    "number.base": "Deploy percentage must be a number",
    "number.min": "Deploy percentage cannot be negative",
    "number.max": "Deploy percentage cannot be greater than 100",
    "any.required": "Deploy percentage is required",
  }),

  assets: Joi.array()
    .items(marketFallAssetRuleValidationSchema)
    .default([])
    .custom((assets, helpers) => {
      const assetIds = assets.map((asset) => asset.assetId);

      if (hasDuplicateValues(assetIds)) {
        return helpers.error("array.duplicateAsset");
      }

      return assets;
    })
    .messages({
      "array.base": "Market fall assets must be an array",
      "array.duplicateAsset":
        "Same asset cannot be repeated inside one market fall rule",
    }),
});

// ===============================
// Create Portfolio Rebalancer Validation Schema
// Matches portfolioRebalancerSchema
// ===============================

const createPortfolioRebalancerValidationSchema = Joi.object({
  portfolioGroupId: objectId.required().messages({
    "any.required": "Portfolio group id is required",
    "string.empty": "Portfolio group id is required",
  }),

  sipAmount: Joi.number().min(1000).required().messages({
    "any.required": "SIP Amount is required",
    "number.base": "SIP Amount Should be Number",
    "number.min": "SIP Amount must be at least 1000",
  }),

  rebalancerName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Rebalancer name is required",
    "string.min": "Rebalancer name must be at least 2 characters",
    "string.max": "Rebalancer name cannot be greater than 100 characters",
    "any.required": "Rebalancer name is required",
  }),

  rebalancerDescription: Joi.string().trim().allow("").max(500).default(""),

  assets: Joi.array()
    .items(assetTargetValidationSchema)
    .min(1)
    .required()
    .custom((assets, helpers) => {
      const totalWeight = assets.reduce((sum, asset) => {
        return sum + Number(asset.targetWeight || 0);
      }, 0);

      if (roundTwo(totalWeight) !== 100) {
        return helpers.message(
          `Total asset target weight must be exactly 100. Current total is ${roundTwo(
            totalWeight,
          )}`,
        );
      }

      const assetIds = assets.map((asset) => asset.assetId);

      if (hasDuplicateValues(assetIds)) {
        return helpers.error("array.duplicateAsset");
      }

      return validateSingleCashReserveAsset(assets, helpers);
    })
    .messages({
      "array.base": "Assets must be an array",
      "array.min": "At least one asset is required",
      "any.required": "Assets are required",
      "array.duplicateAsset": "Duplicate assets are not allowed",
      "array.singleCashReserve": "Exactly one allocation asset must be cash reserve",
    }),

  marketFallRules: Joi.array()
    .items(marketFallRuleValidationSchema)
    .default([])
    .custom((rules, helpers) => {
      const fallPercentages = rules.map((rule) => rule.fallPercentage);

      if (hasDuplicateValues(fallPercentages)) {
        return helpers.error("array.duplicateFallPercentage");
      }

      return rules;
    })
    .messages({
      "array.base": "Market fall rules must be an array",
      "array.duplicateFallPercentage":
        "Duplicate market fall percentages are not allowed",
    }),
})
  .custom(validateMarketFallAssetsAgainstMainAssets)
  .messages({
    "object.marketFallAssetMismatch":
      "Market fall rule contains asset ids that are not present in main assets: {{#invalidAssetIds}}",
    "object.marketFallAssetsNeedMainAssets":
      "Main assets are required to validate market fall rule assets",
    "object.marketFallCashReserveAsset":
      "Cash reserve assets cannot be selected in market fall rules: {{#cashReserveAssetIds}}",
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

// ===============================
// Update Portfolio Rebalancer Validation Schema
// Matches portfolioRebalancerSchema
// ===============================

const updatePortfolioRebalancerValidationSchema = Joi.object({
  sipAmount: Joi.number().min(1000).optional().messages({
    "number.base": "SIP Amount Should be Number",
    "number.min": "SIP Amount must be at least 1000",
  }),

  rebalancerName: Joi.string().trim().min(2).max(100).optional().messages({
    "string.empty": "Rebalancer name cannot be empty",
    "string.min": "Rebalancer name must be at least 2 characters",
    "string.max": "Rebalancer name cannot be greater than 100 characters",
  }),

  rebalancerDescription: Joi.string().trim().allow("").max(500).optional(),

  assets: Joi.array()
    .items(assetTargetValidationSchema)
    .min(1)
    .optional()
    .custom((assets, helpers) => {
      const totalWeight = assets.reduce((sum, asset) => {
        return sum + Number(asset.targetWeight || 0);
      }, 0);

      if (roundTwo(totalWeight) !== 100) {
        return helpers.message(
          `Total asset target weight must be exactly 100. Current total is ${roundTwo(
            totalWeight,
          )}`,
        );
      }

      const assetIds = assets.map((asset) => asset.assetId);

      if (hasDuplicateValues(assetIds)) {
        return helpers.error("array.duplicateAsset");
      }

      return validateSingleCashReserveAsset(assets, helpers);
    })
    .messages({
      "array.base": "Assets must be an array",
      "array.min": "At least one asset is required",
      "array.duplicateAsset": "Duplicate assets are not allowed",
      "array.singleCashReserve": "Exactly one allocation asset must be cash reserve",
    }),

  marketFallRules: Joi.array()
    .items(marketFallRuleValidationSchema)
    .optional()
    .custom((rules, helpers) => {
      const fallPercentages = rules.map((rule) => rule.fallPercentage);

      if (hasDuplicateValues(fallPercentages)) {
        return helpers.error("array.duplicateFallPercentage");
      }

      return rules;
    })
    .messages({
      "array.base": "Market fall rules must be an array",
      "array.duplicateFallPercentage":
        "Duplicate market fall percentages are not allowed",
    }),

  isActive: Joi.boolean().optional(),
})
  .min(1)
  .custom(validateMarketFallAssetsAgainstMainAssets)
  .messages({
    "object.marketFallAssetMismatch":
      "Market fall rule contains asset ids that are not present in main assets: {{#invalidAssetIds}}",
    "object.marketFallAssetsNeedMainAssets":
      "Main assets are required to validate market fall rule assets",
    "object.marketFallCashReserveAsset":
      "Cash reserve assets cannot be selected in market fall rules: {{#cashReserveAssetIds}}",
  })
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

// ===============================
// Exports
// ===============================

module.exports = {
  groupStatement_joi_Schema,
  trade_joi_Schema,
  assetTargetValidationSchema,
  marketFallAssetRuleValidationSchema,
  marketFallRuleValidationSchema,
  createPortfolioRebalancerValidationSchema,
  updatePortfolioRebalancerValidationSchema,
};
