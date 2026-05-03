const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  getDefaultMetadata,
} = require("../../controllers/publicDataView/publicDataViewControllers");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router.route("/defaultmetadata").get(getDefaultMetadata);

// // ! Portfolio Group Statement Ledger Routes
// router
//   .route("/:pg_id/grouptransaction")
//   .post(
//     isLogedIn,
//     validateID("pg_id"),
//     validate_GroupStatementData,
//     groupstatementTransaction,
//   );

// router
//   .route("/:pg_id/trade/:a_id")
//   .post(
//     isLogedIn,
//     validateID("pg_id"),
//     validateID("a_id"),
//     validate_tradeData,
//     trade,
//   );

module.exports = router;
