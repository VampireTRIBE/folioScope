const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  addGroup,
  deleteGroup,
  updateGroup,
} = require("../../controllers/portfolio/portfolioGroupControllers");
const {
  groupstatementTransaction,
} = require("../../controllers/portfolio/portfolioGroupStatementControllers");
const {
  trade,
} = require("../../controllers/portfolio/portfolioTradeControllers");

// ! Validate Request Data
const {
  validateID,
} = require("../../utils/validations/contentValidater/validateID");
const {
  validate_GroupStatementData,
  validate_tradeData,
} = require("../../utils/validations/middlewares/joi_validation/validate_Data/portfolioData");
const { isLogedIn } = require("../../utils/authentication/isLogedIn");

// ! routes

// ! Portfolio Group Routes
router
  .route("/:pg_id")
  .post(isLogedIn, validateID("pg_id"), addGroup)
  .patch(isLogedIn, validateID("pg_id"), updateGroup)
  .delete(isLogedIn, validateID("pg_id"), deleteGroup);

// ! Portfolio Group Statement Ledger Routes
router
  .route("/:pg_id/grouptransaction")
  .post(
    isLogedIn,
    validateID("pg_id"),
    validate_GroupStatementData,
    groupstatementTransaction,
  );

router
  .route("/:pg_id/trade/:a_id")
  .post(
    isLogedIn,
    validateID("pg_id"),
    validateID("a_id"),
    validate_tradeData,
    trade,
  );

module.exports = router;
