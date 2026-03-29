const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  addGroup,
  deleteGroup,
  updateGroup,
} = require("../../controllers/portfolio/portfolioControllers");
const {
  isLogedIn,
} = require("../../utils/shared_Utils/helpers/authenticationUtils");
const {
  validateID,
} = require("../../utils/shared_Utils/helpers/mongoDBValitation");

// routes

router
  .route("/:pg_id")
  .post(isLogedIn, validateID("pg_id"), addGroup)
  .patch(isLogedIn, validateID("pg_id"), updateGroup)
  .delete(isLogedIn, validateID("pg_id"), deleteGroup);
module.exports = router;
