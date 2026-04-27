const express = require("express");
const router = express.Router({ mergeParams: true });

const { clearDatabase } = require("../../controllers/test/testControllers");

router.route("/cleardatabase").get(clearDatabase);
module.exports = router;
