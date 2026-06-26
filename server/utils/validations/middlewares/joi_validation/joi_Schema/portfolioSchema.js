const Joi = require("joi");

module.exports.groupStatement_joi_Schema = Joi.object({
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

module.exports.trade_joi_Schema = Joi.object({
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

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "{{#label}} must be a valid MongoDB ObjectId",
  });

const assetTargetValidationSchema = Joi.object({
  assetId: objectId.required().messages({
    "any.required": "Asset id is required",
  }),
  groupId: objectId.required().messages({
    "any.required": "Group id is required",
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
});

const createPortfolioRebalancerValidationSchema = Joi.object({
  portfolioGroupId: objectId.required().messages({
    "any.required": "Portfolio group id is required",
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
    .messages({
      "array.base": "Assets must be an array",
      "array.min": "At least one asset is required",
      "any.required": "Assets are required",
    }),

  isActive: Joi.boolean().default(true),
}).options({
  abortEarly: false,
  stripUnknown: true,
});

const updatePortfolioRebalancerValidationSchema = Joi.object({
  rebalancerName: Joi.string().trim().min(2).max(100).optional(),
  rebalancerDescription: Joi.string().trim().allow("").max(500).optional(),
  assets: Joi.array().items(assetTargetValidationSchema).min(1).optional(),
  isActive: Joi.boolean().optional(),
})
  .min(1)
  .options({
    abortEarly: false,
    stripUnknown: true,
  });

module.exports = {
  assetTargetValidationSchema,
  createPortfolioRebalancerValidationSchema,
  updatePortfolioRebalancerValidationSchema,
};
