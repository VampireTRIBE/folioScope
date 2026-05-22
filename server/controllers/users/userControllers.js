const crypto = require("node:crypto");

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const USER_MODEL = require("../../models/users_Models/user");
const SESSION_MODEL = require("../../models/users_Models/session");
const PORTOLIOGROUP_MODEL = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");

const NavSystem_Model = require("../../models/Portfolio_Models/PortfolioMetrix_Models/navSystem");

const {
  hashPassword,
  generateJWTToken,
} = require("../../utils/authentication/authUtils");
const { cookieObj } = require("../../utils/authentication/cookieObj");
const { verifyMail } = require("../../utils/authentication/verifyMail");
const { hashRefreshToken } = require("../../middlewares/authentication");

const createSession = async ({ userId, refreshToken, req, session = null }) => {
  const hashedRefreshToken = hashRefreshToken(refreshToken);

  const sessionId = crypto.randomUUID();

  await SESSION_MODEL.create(
    [
      {
        userId,
        sessionId,
        refreshToken: hashedRefreshToken,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    ],
    { session },
  );

  return sessionId;
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
        },
      ],
      { session },
    );

    await session.commitTransaction();

    const emailVerifyToken = generateJWTToken(
      {
        id: newUser._id,
        type: "email_verify",
      },
      "15m",
    );

    await verifyMail(emailVerifyToken, email);

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
    session.startTransaction();

    const authaccessToken = req.accessToken;
    const { id, type } = jwt.verify(authaccessToken, process.env.JWT_SECRET);

    if (type !== "email_verify") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Invalid token type",
      });
    }

    const user = await USER_MODEL.findById(id, null, { session });

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

    const refreshToken = generateJWTToken({ id: user._id }, "7d");

    const sessionId = await createSession({
      userId: user._id,
      refreshToken,
      req,
      session,
    });

    await session.commitTransaction();

    const accessToken = generateJWTToken({
      id: user._id,
    });

    res.cookie("refreshToken", refreshToken, cookieObj);
    res.cookie("sessionId", sessionId, cookieObj);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      accessToken: accessToken,
      userId: user.id,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Token expired",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Token verification failed",
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
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Wrong credentials",
      });
    }

    const refreshToken = generateJWTToken({ id: user._id }, "7d");
    const existingSessionId = req.cookies?.sessionId;

    await SESSION_MODEL.deleteOne({
      sessionId: existingSessionId,
      userId: user._id,
    });

    const sessionId = await createSession({
      userId: user._id,
      refreshToken,
      req,
    });

    const accessToken = generateJWTToken({
      id: user._id,
    });

    res.cookie("refreshToken", refreshToken, cookieObj);
    res.cookie("sessionId", sessionId, cookieObj);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      userId: user._id,
      accessToken,
    });
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

module.exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      res
        .status(400)
        .json({ success: false, message: "RefreshToken not found" });
    }

    const { id, iat, exp } = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const accessToken = generateJWTToken({ id: id });
    const newRefreshToken = generateJWTToken({ id: id }, "7d");

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    res
      .status(200)
      .json({ success: true, message: "Access Token Genrated", accessToken });
  } catch (error) {
    next(error);
  }
};

// module.exports.logout_User = async (req, res, next) => {
//   req.logout((err) => {
//     if (err) {
//       return next(err);
//     }
//     res.status(200).json({ success: "LogOut successful" });
//   });
// };

// module.exports.isLogedIn = async (req, res, next) => {
//   if (req.isAuthenticated()) {
//     return res.status(200).json({
//       authenticated: true,
//     });
//   } else {
//     res.json({ authenticated: false });
//   }
// };
