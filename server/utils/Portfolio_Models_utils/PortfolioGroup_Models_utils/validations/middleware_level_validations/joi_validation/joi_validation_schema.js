const Joi = require("joi");

const groupStatementValidation = Joi.object({
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

const tradeValidation = Joi.object({
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

module.exports = { groupStatementValidation, tradeValidation };
