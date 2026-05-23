const express = require("express");
const router = express.Router();

// ! middlewares
const {
  validate_RegisterData,
  validate_loginDATA,
  validate_email,
  validate_otp,
  validate_ChangePasswordDATA,
} = require("../../utils/validations/middlewares/joi_validation/validate_Data/usersData");
const {
  verifyAccessToken,
  verifyEmailTokenCheck,
  verifyRefreshToken,
} = require("../../middlewares/authentication");

// ! Controllers
const {
  login_User,
  register_NewUser,
  logout_User,
  emailVerify,
  logout_AllUser,
  sendVerificationEmail,
  forgotPassword,
  confirmPassword,
  verifyOtp,
  accessTokenRotation,
} = require("../../controllers/users/userControllers");
const {
  validateParamsEmail,
} = require("../../utils/validations/contentValidater/validateEmail");

// routes

router.route("/signup").post(validate_RegisterData, register_NewUser);

router.post("/verifyemail", verifyEmailTokenCheck, emailVerify);
router.post("/sendverificationemail", validate_email, sendVerificationEmail);

router.route("/login").post(validate_loginDATA, login_User);
router.post("/refreshtoken", verifyRefreshToken, accessTokenRotation);

router.post("/forgotpassword", validate_email, forgotPassword);
router.post(
  "/verifyotp/:email",
  validate_otp,
  validateParamsEmail("email"),
  verifyOtp,
);

router.post(
  "/confirmpassword/:email",
  validate_ChangePasswordDATA,
  validateParamsEmail("email"),
  confirmPassword,
);

router.route("/logoutuser").post(verifyAccessToken, logout_User);
router.route("/logoutalluser").post(verifyAccessToken, logout_AllUser);

module.exports = router;
