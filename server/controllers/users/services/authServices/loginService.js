const crypto = require("node:crypto");

const bcrypt = require("bcrypt");

// ! MODELS
const USER_MODEL = require("../../../../models/Users_Models/user");
const SESSION_MODEL = require("../../../../models/Users_Models/session");

// ! Main utils
const {
  hashPassword,
  generateJWTToken,
} = require("../../../../utils/authentication/authUtils");

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
const {
  find_AllPortfolioGroups_BY_Level,
} = require("../../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroupIDsBylevel");
const { get_AllLeafNodes } = require("../../../../utils/mongodb/aggregations/get_LeafNodes");

module.exports.register_Service = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role, isActive } = req.body;

    const hashedPassword = await hashPassword(password);
    const newUser = await USER_MODEL.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
      isActive,
      verificationLastSentAt: Date.now(),
    });

    const emailVerifyToken = generateJWTToken(
      {
        id: newUser._id,
        type: "email_verify",
      },
      "15m",
    );

    await sendVerificationMail(emailVerifyToken, email);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please verify your email.",
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new customError("User already exists", 409);
    }
    next(error);
  }
};

module.exports.login_Service = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const filterObj = {
      email,
    };

    const user = await find_validate_user({ filterObj });
    if (!user.isVerified) {
      throw new customError("VERIFYEMAIL", 400);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new customError("Wrong credentials", 400);
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

    // find Users portolio Groups

    const filterObjLevel1 = { userId: user._id, level: 1 };
    const filterObjLevel2 = { userId: user._id, level: 2 };
    const filterObjLevel3 = { userId: user._id, level: 3 };
    const filterObjLevel4 = { userId: user._id, level: 4 };

    const LeafGroupIDs = await get_AllLeafNodes(userID);
    let LeafGroupIDsOBJ = {};
    for (const el of LeafGroupIDs) {
      LeafGroupIDsOBJ[el] = "TRUE";
    }

    const [level1_Groups, level2_Groups, level3_Groups, level4_Groups] =
      await Promise.all([
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel1,
          LeafGroupIDsOBJ,
        }),
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel2,
          LeafGroupIDsOBJ,
        }),
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel3,
          LeafGroupIDsOBJ,
        }),
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel4,
          LeafGroupIDsOBJ,
        }),
      ]);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        groups: {
          level1: level1_Groups,
          level2: level2_Groups,
          level3: level3_Groups,
          level4: level4_Groups,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports.logoutUser_Service = async (req, res, next) => {
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

module.exports.logoutAllUser_Service = async (req, res, next) => {
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
      message: "Logout All successful",
    });
  } catch (error) {
    return next(error);
  }
};
