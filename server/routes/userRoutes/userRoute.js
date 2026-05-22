const express = require("express");
const router = express.Router();

const {
  login_User,
  register_NewUser,
  logout_User,
  isLogedIn,
  emailVerify,
  refreshToken,
} = require("../../controllers/users/userControllers");
const {
  validate_RegisterData,
  validate_loginDATA,
} = require("../../utils/validations/middlewares/joi_validation/validate_Data/usersData");
const { accessTokenCheck } = require("../../middlewares/authentication");

// ! middlewares

// routes

router.route("/signup").post(validate_RegisterData, register_NewUser);
router.post("/verify", accessTokenCheck, emailVerify);
router.route("/login").post(validate_loginDATA, login_User);
router.get("/refreshtoken", refreshToken);

// router.route("/logout").get(logout_User);

// router.route("/islogedin").get(isLogedIn);

module.exports = router;
