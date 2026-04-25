const {
  groupStatement_joi_Schema,
  trade_joi_Schema,
} = require("../joi_Schema/portfolioSchema");

module.exports.validate_GroupStatementData = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: "Invalid PayLoad",
    });
  }
  const { error } = groupStatement_joi_Schema.validate(req.body);
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
  const { error } = trade_joi_Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  next();
};
