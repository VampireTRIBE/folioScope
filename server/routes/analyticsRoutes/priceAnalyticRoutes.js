const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  priceSecurityDrawdownAnalytic,
  priceGroupDrawdownAnalytic,
  xirrAnalytic,
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
  
router.route("/xirr/group/:groupId").post(verifyAccessToken, xirrAnalytic);

module.exports = router;
