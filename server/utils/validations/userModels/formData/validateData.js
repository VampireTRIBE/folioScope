const JoiValidation = require("./joi_DataValitations");

const validation = {
  registerDATA(req, res, next) {
    const { error } = JoiValidation.userRegistrationDataValidation.validate(
      req.body,
    );
    if (error) {
      return res.status(404).json({
        error: error.details[0].message,
      });
    }
    next();
  },

  loginDATA(req, res, next) {
    const { username, password } = req.body;
    if (!username || !password || password.length < 8) {
      return res.status(404).json({
        error: "Username Or Password Not Valid",
      });
    }
    next();
  },
};

module.exports = validation;
