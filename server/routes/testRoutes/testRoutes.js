const express = require("express");
const router = express.Router({ mergeParams: true });

const {
  clearDatabase,
  getGroup,
} = require("../../controllers/test/testControllers");

router.route("/cleardatabase").get(clearDatabase);
router.route("/:g_id").get(getGroup);
module.exports = router;
