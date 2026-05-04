const express = require("express");
const router = express.Router({ mergeParams: true });

// ! Controllers
const {
  getDefaultMetadata,
  getAllSecuritiesList,
} = require("../../controllers/publicDataView/publicDataViewControllers");

// ! Validate Request Data

// ! routes

// ! Public Data Fetch Routes
router.route("/allsecuritieslist").get(getAllSecuritiesList);
router.route("/defaultmetadata").get(getDefaultMetadata);

module.exports = router;
