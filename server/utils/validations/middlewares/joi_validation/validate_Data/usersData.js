const {
  newUserRegisteration_joi_Schema,
  authValidationSchema,
} = require("../joi_Schema/usersSchema");

module.exports.validate_RegisterData = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: "Invalid PayLoad",
    });
  }
  const { error } = newUserRegisteration_joi_Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};

module.exports.validate_loginDATA = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: "Invalid PayLoad",
    });
  }
  const { error } = authValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }
  next();
};
