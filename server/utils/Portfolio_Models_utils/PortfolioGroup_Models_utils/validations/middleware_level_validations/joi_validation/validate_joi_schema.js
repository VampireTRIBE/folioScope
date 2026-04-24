const {
  groupStatementValidation,
  tradeValidation,
} = require("./joi_validation_schema");

module.exports.validate_GroupStatementData = (req, res, next) => {
  const { error } = groupStatementValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  next();
};

module.exports.validate_tradeData = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: "Invalid PayLoad",
    });
  }
  const { error } = tradeValidation.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  next();
};
