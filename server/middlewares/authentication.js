const jwt = require("jsonwebtoken");
const SESSION_MODEL = require("../models/Users_Models/session");

module.exports.verifyAccessToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const accessToken = authHeader.split(" ")[1];

    const { id, sessionDocId } = jwt.verify(
      accessToken,
      process.env.JWT_SECRET,
    );

    const sessionDoc = await SESSION_MODEL.findOne({
      _id: sessionDocId,
      userId: id,
      revoke: false,
      expiresAt: { $gt: new Date() },
    });

    if (!sessionDoc) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    req.userId = id;
    req.sessionDocId = sessionDocId;
    req.sessionDoc = sessionDoc;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Access token expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid access token",
    });
  }
};

module.exports.verifyEmailTokenCheck = (req, res, next) => {
  try {
    const authHeader = req?.headers?.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(400).json({
        success: false,
        message: "Token missing or invalid",
      });
    }

    const verifyEmailToken = authHeader.split(" ")[1];
    const { id, type } = jwt.verify(verifyEmailToken, process.env.JWT_SECRET);

    if (type !== "email_verify") {
      return res.status(403).json({
        success: false,
        message: "Invalid token type",
      });
    }

    req.verifyEmailToken = verifyEmailToken;
    req.userId = id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
    return next(error);
  }
};

module.exports.verifyRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    const cookieSessionId = req.cookies?.sessionId;

    if (!refreshToken || !cookieSessionId) {
      return res.status(401).json({
        success: false,
        message: "Credentials missing",
      });
    }

    const { id, sessionId } = jwt.verify(
      refreshToken,
      process.env.JWT_SECRET,
    );

    if (sessionId !== cookieSessionId) {
      return res.status(403).json({
        success: false,
        message: "Session mismatch",
      });
    }

    const sessionDoc = await SESSION_MODEL.findOne({
      userId: id,
      sessionId,
      revoke: false,
      expiresAt: { $gt: new Date() },
    });

    if (!sessionDoc) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    req.userId = id;
    req.sessionId = sessionId;
    req.refreshToken = refreshToken;
    req.sessionDoc = sessionDoc;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    return next(error);
  }
};
