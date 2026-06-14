// ! Third Party Packeges
const mongoose = require("mongoose");

// ! Utils
const customError = require("../../../../shared/error/customError");

module.exports.find_AllPortfolioGroups_BY_Level = async ({
  filterObj = null,
}) => {
  try {
    const PORTFOLIOGROUP_MODEL = mongoose.model("portfolioGroup");
    if (!filterObj) {
      throw new customError("Filter Object Required", 400);
    }
    const portfolioGroups = await PORTFOLIOGROUP_MODEL.find(filterObj)
      .select("level name")
      .lean();
    if (!portfolioGroups) {
      throw new customError("Portfolio Group does not exist", 400);
    }

    let returnObj = {};

    for (const group of portfolioGroups) {
      returnObj[group.name] = group;
    }
    
    return returnObj;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Internal Server Error", 500);
  }
};
