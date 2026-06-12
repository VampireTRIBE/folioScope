const express = require("express");
const router = express.Router();

// ! Controllers
const {
  update_Classification,
  update_AssetMetaData,
  insert_PriceHistory,
} = require("../../controllers/admin/adminControllers");

// ! Auth Middleware
const { verifyAccessToken } = require("../../middlewares/authentication");

// ! routes

router
  .route("/seedclassification")
  .post(verifyAccessToken, update_Classification);
router
  .route("/seedassetmetadata")
  .post(verifyAccessToken, update_AssetMetaData);
router.route("/seedpricehistory").post(verifyAccessToken, insert_PriceHistory);

module.exports = router;
