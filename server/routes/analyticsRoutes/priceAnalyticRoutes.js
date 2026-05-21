const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  priceDrawdownAnalytic,
} = require("../../controllers/analytic/PriceAnalytic/priceAnalyticController");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router.route("/drawdown/:securityId").get(priceDrawdownAnalytic);

module.exports = router;
