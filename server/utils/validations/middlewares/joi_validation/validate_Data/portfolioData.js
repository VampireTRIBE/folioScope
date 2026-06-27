const {
  groupStatement_joi_Schema,
  trade_joi_Schema,
  createPortfolioRebalancerValidationSchema,
  updatePortfolioRebalancerValidationSchema,
} = require("../joi_Schema/portfolioSchema");

// ===============================
// ! Helper: Empty Payload Check
// ===============================
const isEmptyPayload = (body) => {
  return !body || Object.keys(body).length === 0;
};

// ===============================
// ! Helper: Format Joi Errors
// ===============================
const formatJoiErrors = (error) => {
  return error.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message,
  }));
};

// ===============================
// ! Helper: Generic Joi Validator
// ===============================
const validateWithSchema = (schema, req, res, next) => {
  if (isEmptyPayload(req.body)) {
    return res.status(400).json({
      success: false,
      message: "Invalid payload",
    });
  }

  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
  req.body = value;
  next();
};

// ===============================
// ! Validate Group Statement Data
// ===============================
module.exports.validate_GroupStatementData = (req, res, next) => {
  return validateWithSchema(groupStatement_joi_Schema, req, res, next);
};

// ===============================
// ! Validate Trade Data
// ===============================
module.exports.validate_tradeData = (req, res, next) => {
  return validateWithSchema(trade_joi_Schema, req, res, next);
};

// ===============================
// ! Validate Create Portfolio Rebalancer Data
// ===============================
module.exports.validate_CreatePortfolioRebalancerData = (req, res, next) => {
  return validateWithSchema(
    createPortfolioRebalancerValidationSchema,
    req,
    res,
    next,
  );
};

// ===============================
// ! Validate Update Portfolio Rebalancer Data
// ===============================
module.exports.validate_UpdatePortfolioRebalancerData = (req, res, next) => {
  return validateWithSchema(
    updatePortfolioRebalancerValidationSchema,
    req,
    res,
    next,
  );
};
