const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  priceDrawdownAnalytic,
} = require("../../controllers/analytic/PriceAnalytic/priceAnalyticController");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router.route("/drawdown/:assetId").get(priceDrawdownAnalytic);

module.exports = router;
