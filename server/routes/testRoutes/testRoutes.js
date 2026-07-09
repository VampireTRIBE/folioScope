const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  clearDatabase,
  getGroup,
  adjustFactor,
} = require("../../controllers/test/testControllers");

router.route("/cleardatabase").get(clearDatabase);
router.route("/adjust").get(adjustFactor);
router.route("/:g_id").get(getGroup);
module.exports = router;
