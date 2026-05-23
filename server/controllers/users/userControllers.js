const crypto = require("node:crypto");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const USER_MODEL = require("../../models/users_Models/user");
const SESSION_MODEL = require("../../models/users_Models/session");
const PORTOLIOGROUP_MODEL = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");

const {
  hashPassword,
  generateJWTToken,
  hashRefreshToken,
} = require("../../utils/authentication/authUtils");
const { verifyMail } = require("../../utils/authentication/verifyMail");
const { cookieObj } = require("../../utils/authentication/cookieObj");

const customError = require("../../utils/shared/error/customError");

const createSession = async ({
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

module.exports.sendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await USER_MODEL.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    const now = Date.now();

    const lastVerificationTime = user?.verificationLastSentAt
      ? new Date(user.verificationLastSentAt).getTime()
      : 0;

    // RESET RETRY COUNT AFTER 24 HOURS
    if (now - lastVerificationTime > 24 * 60 * 60 * 1000) {
      user.verificationRetry = 0;
    }

    if (now - lastVerificationTime < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: "Retry after sometime",
      });
    }

    if (user.verificationRetry >= 10) {
      return res.status(429).json({
        success: false,
        message: "Max retry limit reached. Try again after 24 hours",
      });
    }

    const emailVerifyToken = generateJWTToken(
      {
        id: user._id,
        type: "email_verify",
      },
      "15m",
    );

    await verifyMail(emailVerifyToken, email);

    user.verificationRetry += 1;
    user.verificationLastSentAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: `Check your mail for verification: ${email}`,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.register_NewUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const { firstName, lastName, email, password, role, isActive } = req.body;

    const hashedPassword = await hashPassword(password);
    const [newUser] = await USER_MODEL.create(
      [
        {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role,
          isActive,
          verificationLastSentAt: Date.now(),
        },
      ],
      { session },
    );

    const emailVerifyToken = generateJWTToken(
      {
        id: newUser._id,
        type: "email_verify",
      },
      "15m",
    );

    await verifyMail(emailVerifyToken, email);

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports.emailVerify = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.userId;

    session.startTransaction();
    const user = await USER_MODEL.findById(userId, null, { session });

    if (!user) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    user.isVerified = true;
    await user.save({ session });

    const existingRootGroup = await PORTOLIOGROUP_MODEL.findOne(
      {
        userId: user._id,
        level: 1,
        parentId: null,
      },
      null,
      { session },
    );

    if (!existingRootGroup) {
      await PORTOLIOGROUP_MODEL.create(
        [
          {
            name: "NET WORTH",
            parentId: null,
            description: "NET WORTH DEFAULT GROUP",
            level: 1,
            userId: user._id,
          },
        ],
        { session },
      );
    }

    const sessionId = crypto.randomUUID();
    const refreshToken = generateJWTToken(
      { id: user._id, sessionId: sessionId },
      "7d",
    );

    const { sessionDocId } = await createSession({
      userId: user._id,
      sessionId,
      refreshToken,
      req,
      session,
    });

    await session.commitTransaction();
    const accessToken = generateJWTToken({
      id: user._id,
      sessionDocId,
    });

    res.cookie("refreshToken", refreshToken, cookieObj);
    res.cookie("sessionId", sessionId, cookieObj);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      accessToken: accessToken,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return res.status(400).json({
      success: false,
      message: error.message || "Email verification failed",
    });
  }
};

module.exports.login_User = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await USER_MODEL.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Account is disabled",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email",
        task: "VERIFYEMAIL",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Wrong credentials",
      });
    }

    const existingSessionId = req.cookies?.sessionId;
    await SESSION_MODEL.deleteOne({
      sessionId: existingSessionId,
      userId: user._id,
    });

    res.clearCookie("refreshToken", cookieObj);
    res.clearCookie("sessionId", cookieObj);

    const sessionId = crypto.randomUUID();
    const refreshToken = generateJWTToken(
      { id: user._id, sessionId: sessionId },
      "7d",
    );

    const { sessionDocId } = await createSession({
      userId: user._id,
      sessionId,
      refreshToken,
      req,
    });

    const accessToken = generateJWTToken({
      id: user._id,
      sessionDocId,
    });

    res.cookie("refreshToken", refreshToken, cookieObj);
    res.cookie("sessionId", sessionId, cookieObj);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.refreshToken;
    const cookieSessionId = req.sessionId;
    const userId = req.userId;
    const sessionDoc = req.sessionDoc;

    const hashedRefreshToken = hashRefreshToken(refreshToken);

    if (!sessionDoc) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired session",
      });
    }

    // FIND USER
    const user = await USER_MODEL.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // USER DISABLED
    if (!user.isActive) {
      await SESSION_MODEL.updateMany({ userId: user._id }, { revoke: true });

      return res.status(403).json({
        success: false,
        message: "Account disabled",
      });
    }

    // EMAIL NOT VERIFIED
    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Email not verified",
        task: "VERIFYEMAIL",
      });
    }

    // GENERATE NEW REFRESH TOKEN
    const newRefreshToken = generateJWTToken(
      {
        id: user._id,
        sessionId: sessionDoc.sessionId,
      },
      "7d",
    );

    // HASH NEW REFRESH TOKEN
    const newHashedRefreshToken = hashRefreshToken(newRefreshToken);

    // ATOMIC TOKEN ROTATION
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

      return res.status(403).json({
        success: false,
        message: "Refresh token reuse detected",
      });
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

module.exports.logout_User = async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionDocId = req.sessionDocId;
    const sessionDoc = req.sessionDoc;

    await SESSION_MODEL.findByIdAndUpdate(sessionDocId, {
      revoke: true,
    });

    res.clearCookie("refreshToken", cookieObj);
    res.clearCookie("sessionId", cookieObj);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.logout_AllUser = async (req, res, next) => {
  try {
    const userId = req.userId;
    const sessionDocId = req.sessionDocId;
    const sessionDoc = req.sessionDoc;

    await SESSION_MODEL.updateMany(
      {
        userId,
        revoke: false,
      },
      {
        revoke: true,
      },
    );

    res.clearCookie("refreshToken", cookieObj);
    res.clearCookie("sessionId", cookieObj);

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    return next(error);
  }
};
