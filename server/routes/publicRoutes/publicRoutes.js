const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  getDefaultMetadata,
  getAllSecuritiesList,
  getTodaysSecurities,
  getSecurityOverview,
} = require("../../controllers/publicDataView/publicDataViewControllers");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router.route("/allsecuritieslist").get(getAllSecuritiesList);
router.route("/defaultmetadata").get(getDefaultMetadata);
router.route("/top/securities").get(getTodaysSecurities);
router.route("/security/:securityId").get(getSecurityOverview);

module.exports = router;
