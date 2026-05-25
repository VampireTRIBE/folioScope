const crypto = require("node:crypto");

const mongoose = require("mongoose");

const {
  generateJWTToken,
} = require("../../../../utils/authentication/authUtils");

// ! MODELs
const PORTOLIOGROUP_MODEL = mongoose.model("portfolioGroup");

// ! sendMail utils
const {
  sendVerificationMail,
} = require("../../../../utils/authentication/SendMail/sendVerificationMail");

// ! Other utils
const customError = require("../../../../utils/shared/error/customError");
const {
  find_validate_user,
} = require("../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const { createSession } = require("../createSession");
const { cookieObj } = require("../../../../utils/authentication/cookieObj");

module.exports.emailVerification_Service = async (req, res, next) => {
  try {
    const { email } = req.body;

    const filterObj = {
      email,
    };

    const user = await find_validate_user({ filterObj });

    if (user.isVerified) {
      throw new customError("Account already verified", 400);
    }

    const now = Date.now();

    const lastVerificationTime = user?.verificationLastSentAt
      ? new Date(user.verificationLastSentAt).getTime()
      : 0;

    if (now - lastVerificationTime > 24 * 60 * 60 * 1000) {
      user.verificationRetry = 0;
    }

    if (now - lastVerificationTime < 60 * 1000) {
      throw new customError("Retry after sometime", 429);
    }

    if (user.verificationRetry >= 10) {
      throw new customError(
        "Max retry limit reached. Try again after 24 hours",
        429,
      );
    }

    const emailVerifyToken = generateJWTToken(
      {
        id: user._id,
        type: "email_verify",
      },
      "15m",
    );

    await sendVerificationMail(emailVerifyToken, email);

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

module.exports.emailVerify_Service = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const userId = req.userId;

    const filterObj = {
      _id: userId,
    };

    const user = await find_validate_user({ filterObj });

    if (user.isVerified) {
      throw new customError("Email already verified", 400);
    }

    session.startTransaction();

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
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Email verification failed", 500);
  } finally {
    session.endSession();
  }
};
