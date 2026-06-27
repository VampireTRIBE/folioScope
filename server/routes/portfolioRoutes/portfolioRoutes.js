const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  addGroup,
  deleteGroup,
  updateGroup,
  get_GroupMetadata,
  fetch_UserHoldings,
  createRebalancer,
  fetchRebalancerList,
  fetchRebalancerById,
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
} = require("../../utils/validations/contentValidator/validateID");
const {
  validate_GroupStatementData,
  validate_tradeData,
  validate_CreatePortfolioRebalancerData,
} = require("../../utils/validations/middlewares/joi_validation/validate_Data/portfolioData");

// ! Auth Middlewares
const { verifyAccessToken } = require("../../middlewares/authentication");

// ! routes

// ! Fetch User Holdings Routes

router.route("/holdings").post(verifyAccessToken, fetch_UserHoldings);

// ! Portfolio Group Rebalncer Routes

router
  .route("/rebalancer/new")
  .post(
    verifyAccessToken,
    validate_CreatePortfolioRebalancerData,
    createRebalancer,
  );
router.route("/rebalancer/list").get(verifyAccessToken, fetchRebalancerList);
router
  .route("/rebalancer/:rebalancerId")
  .get(verifyAccessToken, validateID("rebalancerId"), fetchRebalancerById);

// ! Portfolio Group POST Routes
router
  .route("/:pg_id")
  .get(verifyAccessToken, validateID("pg_id"), get_GroupMetadata)
  .post(verifyAccessToken, validateID("pg_id"), addGroup)
  .patch(verifyAccessToken, validateID("pg_id"), updateGroup)
  .delete(verifyAccessToken, validateID("pg_id"), deleteGroup);

// ! Portfolio Group Statement Ledger Routes
router
  .route("/:pg_id/grouptransaction")
  .post(
    verifyAccessToken,
    validateID("pg_id"),
    validate_GroupStatementData,
    groupstatementTransaction,
  );

router
  .route("/:pg_id/trade/:a_id")
  .post(
    verifyAccessToken,
    validateID("pg_id"),
    validateID("a_id"),
    validate_tradeData,
    trade,
  );

module.exports = router;
