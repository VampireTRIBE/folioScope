const JoiValidation_Schema = require("./joi_validation_schema");

module.exports.validate_RegisterData = (req, res, next) => {
  const { error } =
    JoiValidation_Schema.userRegistrationData_Validation.validate(req.body);
  if (error) {
    return res.status(404).json({
      error: error.details[0].message,
    });
  }
  next();
};

module.exports.validate_loginDATA = (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(404).json({
      error: "Username Or Password Not Valid",
    });
  }
  next();
};
