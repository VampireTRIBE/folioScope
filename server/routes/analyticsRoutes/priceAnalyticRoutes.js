const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  priceSecurityDrawdownAnalytic,
  priceGroupDrawdownAnalytic,
} = require("../../controllers/analytic/PriceAnalytic/priceAnalyticController");
const { verifyAccessToken } = require("../../middlewares/authentication");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router
  .route("/drawdown/security/:securityId")
  .get(priceSecurityDrawdownAnalytic);
router
  .route("/drawdown/group/:groupId")
  .get(verifyAccessToken, priceGroupDrawdownAnalytic);

module.exports = router;
