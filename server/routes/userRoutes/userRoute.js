const express = require("express");
const router = express.Router();

const { validate_RegisterData, validate_loginDATA } = require("../../utils/Users_Models_utils/validations/middleware_level/joi_validation/validate_joi_schema");
const { login_User, register_NewUser, logout_User, isLogedIn } = require("../../controllers/users/userControllers");


// routes

router
  .route("/signup")
  .post(validate_RegisterData, register_NewUser);

router.route("/login").post(validate_loginDATA, login_User);

router.route("/logout").get(logout_User);

router.route("/islogedin").get(isLogedIn);

module.exports = router;