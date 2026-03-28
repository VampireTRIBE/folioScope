const express = require("express");
const adminControllers = require("../../controllers/admin/adminControllers");
const router = express.Router();

// routes

router.route("/seedclassification").post(adminControllers.updateClassification);
router.route("/seedassetmetadata").post(adminControllers.updateAssetMetaData);
router.route("/seedpricehistory").post(adminControllers.insertPriceHistory);

module.exports = router;
