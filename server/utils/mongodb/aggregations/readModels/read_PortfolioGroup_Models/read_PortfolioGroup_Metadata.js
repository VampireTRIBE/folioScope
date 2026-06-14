// ! Third Party Packeges
const mongoose = require("mongoose");

// ! Utils
const customError = require("../../../../shared/error/customError");

module.exports.find_validate_portfolioGroup = async ({ filterObj = null }) => {
  try {
    const PORTFOLIOGROUP_MODEL = mongoose.model("portfolioGroup");
    if (!filterObj) {
      throw new customError("Filter Object Required", 400);
    }
    filterObj.isDeleted = false;
    const portfolioGroup = await PORTFOLIOGROUP_MODEL.findOne(filterObj);
    if (!portfolioGroup) {
      throw new customError("Portfolio Group does not exist", 400);
    }
    return portfolioGroup;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Internal Server Error", 500);
  }
};
