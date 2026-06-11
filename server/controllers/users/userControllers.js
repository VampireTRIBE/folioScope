const {
  register_Service,
  login_Service,
  logoutUser_Service,
  logoutAllUser_Service,
} = require("./services/authServices/loginService");

const {
  emailVerification_Service,
  emailVerify_Service,
} = require("./services/authServices/verificationService");

const {
  accessTokenRotation_Service,
} = require("./services/authServices/tokenRotationService");

const {
  forgotPassword_Service,
  verifyOtp_Service,
  confirmPassword_Service,
} = require("./services/authServices/passwordResetService");
const { Read_UserDetails_Service } = require("./services/ReadServices/userServiece");

module.exports.get_User_Details = async (req, res, next) => {
  try {
    await Read_UserDetails_Service(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports.register_NewUser = async (req, res, next) => {
  try {
    await register_Service(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports.login_User = async (req, res, next) => {
  try {
    await login_Service(req, res, next);
  } catch (error) {
    next(error);
  }
};

module.exports.sendVerificationEmail = async (req, res, next) => {
  try {
    await emailVerification_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports.emailVerify = async (req, res, next) => {
  try {
    await emailVerify_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports.accessTokenRotation = async (req, res, next) => {
  try {
    await accessTokenRotation_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports.logout_User = async (req, res, next) => {
  try {
    await logoutUser_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports.logout_AllUser = async (req, res, next) => {
  try {
    await logoutAllUser_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports.forgotPassword = async (req, res, next) => {
  try {
    await forgotPassword_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports.verifyOtp = async (req, res,next) => {
  try {
    await verifyOtp_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};

module.exports.confirmPassword = async (req, res,next) => {
  try {
    await confirmPassword_Service(req, res, next);
  } catch (error) {
    return next(error);
  }
};
