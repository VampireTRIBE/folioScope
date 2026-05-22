const crypto = require("node:crypto");

module.exports.accessTokenCheck = (req, res, next) => {
  const authHeader = req?.headers?.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(400).json({
      success: false,
      message: "Access Token is missing or invalid",
    });
  }
  req.accessToken = authHeader.split(" ")[1];
  next();
};

module.exports.hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};
