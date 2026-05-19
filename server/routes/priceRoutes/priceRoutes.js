const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers

const {
  priceRange,
} = require("../../controllers/analytic/priceRange/priceRangeController");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router.route("/:securityId").get(priceRange);

module.exports = router;
