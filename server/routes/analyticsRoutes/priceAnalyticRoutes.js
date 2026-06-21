const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  priceSecurityDrawdownAnalytic,
  priceGroupDrawdownAnalytic,
  xirrAnalytic,
  xirrComparison,
  navComparison,
} = require("../../controllers/analytic/PriceAnalytic/priceAnalyticController");

// ! Auth Middleware
const { verifyAccessToken } = require("../../middlewares/authentication");

// ! Valditon Middleware
const {
  validateID,
} = require("../../utils/validations/contentValidator/validateID");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router
  .route("/drawdown/security/:securityId")
  .get(validateID("securityId"), priceSecurityDrawdownAnalytic);

router
  .route("/drawdown/group/:groupId")
  .get(validateID("groupId"), verifyAccessToken, priceGroupDrawdownAnalytic);

router
  .route("/xirr/group/:groupId")
  .post(validateID("groupId"), verifyAccessToken, xirrAnalytic);

router
  .route("/comparision/xirr/:groupId/:indexId")
  .get(
    validateID("groupId"),
    validateID("indexId"),
    verifyAccessToken,
    xirrComparison,
  );

router
  .route("/comparision/nav/:groupId/:indexId")
  .get(
    validateID("groupId"),
    validateID("indexId"),
    verifyAccessToken,
    navComparison,
  );

module.exports = router;
