const express = require("express");
const router = express.Router();

const {
  update_Classification,
  update_AssetMetaData,
  insert_PriceHistory,
} = require("../../controllers/admin/adminControllers");

// ! routes

router.route("/seedclassification").post(update_Classification);
router.route("/seedassetmetadata").post(update_AssetMetaData);
router.route("/seedpricehistory").post(insert_PriceHistory);

module.exports = router;
