const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers

const {
  groupPriceRange,
  priceRange,
} = require("../../controllers/analytic/priceRange/priceRangeController");

// ! Auth Middleware
const { verifyAccessToken } = require("../../middlewares/authentication");
const {
  validateID,
} = require("../../utils/validations/contentValidator/validateID");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router.route("/:securityId").get(priceRange);

router
  .route("/group/:groupId")
  .get(validateID("groupId"), verifyAccessToken, groupPriceRange);

// ! Protected Route

module.exports = router;
