const Joi = require("joi");

const isinValidator = (value, helpers) => {
  if (!value) return value;

  if (!validate_ISIN(value)) {
    return helpers.message("Invalid ISIN format");
  }
  return value;
};

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({
    "string.pattern.base": "Invalid ObjectId format",
  });

module.exports.assetMetaData_joi_Schema = Joi.object({
  isin: Joi.string()
    .uppercase()
    .trim()
    .custom(isinValidator, "ISIN validation")
    .messages({
      "string.base": "ISIN must be a string",
    })
    .optional(),

  tickerCode: Joi.object({
    nse: Joi.string()
      .uppercase()
      .trim()
      .messages({
        "string.base": "NSE ticker must be a string",
      })
      .optional(),

    bse: Joi.string()
      .uppercase()
      .trim()
      .messages({
        "string.base": "BSE ticker must be a string",
      })
      .optional(),
  })
    .or("nse", "bse")
    .messages({
      "object.missing": "At least one of NSE or BSE ticker is required",
    })
    .optional(),

  name: Joi.string().min(3).max(100).trim().required().messages({
    "string.base": "Name must be a string",
    "string.empty": "Name is required",
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 100 characters",
    "any.required": "Name is required",
  }),

  GF_TickerCode: Joi.string().min(3).max(100).trim().optional().messages({
    "string.base": "GF_TickerCode must be a string",
    "string.min": "GF_TickerCode must be at least 3 characters",
    "string.max": "GF_TickerCode cannot exceed 100 characters",
  }),

  overview: Joi.string().max(500).optional().messages({
    "string.base": "Overview must be a string",
    "string.max": "Overview cannot exceed 500 characters",
  }),

  currency: Joi.string().trim().required().messages({
    "string.base": "Currency must be a string",
    "string.empty": "Currency is required",
    "any.required": "Currency is required",
  }),

  assetClass: objectId.required().messages({
    "any.required": "AssetClass is required",
  }),

  assetCategory: objectId.required().messages({
    "any.required": "AssetCategory is required",
  }),

  assetSubCategory: objectId.required().messages({
    "any.required": "AssetSubCategory is required",
  }),

  assetIndexName: objectId.optional(),

  assetSector: objectId.optional(),

  assetIndustry: objectId.optional(),

  assetAMC: objectId.optional(),
})
  .or("isin", "tickerCode.nse", "tickerCode.bse")
  .messages({
    "object.missing":
      "At least one identifier is required (ISIN or NSE/BSE ticker)",
  });
