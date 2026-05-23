const express = require("express");
const router = express.Router();

// ! middlewares
const {
  validate_RegisterData,
  validate_loginDATA,
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
  refreshToken,
  logout_AllUser,
  sendVerificationEmail,
} = require("../../controllers/users/userControllers");

// routes

router.route("/signup").post(validate_RegisterData, register_NewUser);

router.post("/verifyemail", verifyEmailTokenCheck, emailVerify);
router.post("/sendverificationemail", sendVerificationEmail);

router.route("/login").post(validate_loginDATA, login_User);
router.post("/refreshtoken", verifyRefreshToken, refreshToken);

router.route("/logoutuser").post(verifyAccessToken, logout_User);
router.route("/logoutalluser").post(verifyAccessToken, logout_AllUser);

module.exports = router;

// ! to do
// router.post("/forgot-password", userControllers.forgotPassword);
// router.post("/verify-otp/:email", userControllers.verifyOtp);
// router.post("/confirm-password/:email", userControllers.confirmPassword);
