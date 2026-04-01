const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  addGroup,
  deleteGroup,
  updateGroup,
} = require("../../controllers/portfolio/portfolioGroupControllers");
const {
  isLogedIn,
} = require("../../utils/shared_Utils/helpers/authenticationUtils");
const {
  validateID,
} = require("../../utils/shared_Utils/helpers/mongoDBValitation");
const {
  groupstatementTransaction,
} = require("../../controllers/portfolio/portfolioGroupStatementControllers");
const {
  validate_GroupStatementData,
  validate_tradeData,
} = require("../../utils/Portfolio_Models_utils/PortfolioGroup_Models_utils/validations/middleware_level_validations/joi_validation/validate_joi_schema");
const { tradeTransaction } = require("../../controllers/portfolio/portfolioTradeControllers");

// routes

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
    tradeTransaction,
  );

module.exports = router;
