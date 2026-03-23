const express = require("express");
const adminControllers = require("../../controllers/admin/adminControllers");
const router = express.Router();

// routes

router.route("/classification").post(adminControllers.updateClassification);
router.route("/assetmetadata").post(adminControllers.updateAssetMetaData);

module.exports = router;
