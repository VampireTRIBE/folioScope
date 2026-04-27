const express = require("express");
const router = express.Router();

const {
  update_Classification,
  update_AssetMetaData,
  insert_PriceHistory,
} = require("../../controllers/admin/adminControllers");

const { isLogedIn } = require("../../utils/authentication/isLogedIn");

// ! routes

router.route("/seedclassification").post(isLogedIn, update_Classification);
router.route("/seedassetmetadata").post(isLogedIn, update_AssetMetaData);
router.route("/seedpricehistory").post(isLogedIn, insert_PriceHistory);

module.exports = router;
