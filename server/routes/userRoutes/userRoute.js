const express = require("express");
const router = express.Router();

const userController = require("../../controllers/users/userControllers");
const validateData = require("../../utils/validations/userModels/formData/validateData");

// routes

router
  .route("/signup")
  .post(validateData.registerDATA, userController.registerUser);

router.route("/login").post(validateData.loginDATA, userController.loginUser);

router.route("/logout").get(userController.logoutUser);

router.route("/islogedin").get(userController.isLogedIn);

module.exports = router;