// ! MODELS
const SESSION_MODEL = require("../../../../models/Users_Models/session");

// ! Other utils
const customError = require("../../../../utils/shared/error/customError");
const {
  hashRefreshToken,
  generateJWTToken,
} = require("../../../../utils/authentication/authUtils");
const {
  find_validate_user,
} = require("../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");

module.exports.accessTokenRotation_Service = async (req, res, next) => {
  try {
    const refreshToken = req.refreshToken;
    const userId = req.userId;
    const sessionDoc = req.sessionDoc;

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    if (!sessionDoc) {
      throw new customError("Invalid or expired session", 403);
    }

    const filterObj = {
      _id: userId,
    };

    const user = await find_validate_user({ filterObj });

    if (!user.isVerified) {
      throw new customError("VERIFYEMAIL", 400);
    }

    const newRefreshToken = generateJWTToken(
      {
        id: user._id,
        sessionId: sessionDoc.sessionId,
      },
      "7d",
    );

    // HASH NEW REFRESH TOKEN
    const newHashedRefreshToken = hashRefreshToken(newRefreshToken);

    const updatedSession = await SESSION_MODEL.findOneAndUpdate(
      {
        _id: sessionDoc._id,
        refreshToken: hashedRefreshToken,
        revoke: false,
        expiresAt: { $gt: new Date() },
      },
      {
        refreshToken: newHashedRefreshToken,
        lastUsedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        new: true,
      },
    );

    // REPLAY ATTACK / RACE CONDITION
    if (!updatedSession) {
      await SESSION_MODEL.updateMany({ userId: user._id }, { revoke: true });

      res.clearCookie("refreshToken", cookieObj);
      res.clearCookie("sessionId", cookieObj);

      throw new customError("Refresh token reuse detected", 403);
    }

    // GENERATE ACCESS TOKEN
    const accessToken = generateJWTToken({
      id: user._id,
      sessionDocId: updatedSession._id,
    });

    // SET COOKIES
    res.cookie("refreshToken", newRefreshToken, cookieObj);
    res.cookie("sessionId", updatedSession.sessionId, cookieObj);

    return res.status(200).json({
      success: true,
      message: "Access token generated",
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};
