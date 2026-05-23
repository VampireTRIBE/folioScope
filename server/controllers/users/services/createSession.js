const SESSION_MODEL = require("../../../models/Users_Models/session");

const { hashRefreshToken } = require("../../../utils/authentication/authUtils");

module.exports.createSession = async ({
  userId,
  sessionId,
  refreshToken,
  req,
  session = null,
}) => {
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  const [sessionDoc] = await SESSION_MODEL.create(
    [
      {
        userId,
        sessionId,
        refreshToken: hashedRefreshToken,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
    { session },
  );

  return { sessionDocId: sessionDoc._id };
};
