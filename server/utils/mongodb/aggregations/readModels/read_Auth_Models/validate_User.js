// ! Third Party Packeges
const mongoose = require("mongoose");
const customError = require("../../../../shared/error/customError");

module.exports.find_validate_user = async ({
  filterObj = null,
  validateKeyObj = null,
}) => {
  try {
    const USER_MODEL = mongoose.model("users");
    if (!filterObj) {
      throw new customError("Filter Object Required", 400);
    }

    const user = await USER_MODEL.findOne(filterObj);
    if (!user) {
      throw new customError("User does not exist", 400);
    }
    if (!user.isActive) {
      throw new customError("Account is disabled", 403);
    }
    return user;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Internal Server Error", 500);
  }
};
