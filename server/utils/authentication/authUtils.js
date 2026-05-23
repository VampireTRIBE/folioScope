const crypto = require("node:crypto");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports.hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.log("bcrypt Error", error);
    throw new Error(error.message);
  }
};

module.exports.generateJWTToken = (data, expiresIn = "10m") => {
  try {
    return jwt.sign(data, process.env.JWT_SECRET, {
      expiresIn,
    });
  } catch (error) {
    console.log("JWT Error:", error);
    throw new Error(error.message);
  }
};

module.exports.hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
