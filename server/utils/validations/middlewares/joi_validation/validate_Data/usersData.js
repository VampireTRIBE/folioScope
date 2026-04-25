const {
  newUserRegisteration_joi_Schema,
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
      error: error.details[0].message,
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
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(401).json({
      error: "Username Or Password Not Valid",
    });
  }
  next();
};
