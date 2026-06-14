const {
  read_PriceRange1D,
  read_PriceRange,
  read_GroupPriceRange1D,
  read_GroupPriceRange,
} = require("../../../utils/mongodb/aggregations/readModels/readpriceRange/priceRange");

// ! Utils
const customError = require("../../../utils/shared/error/customError");

module.exports.groupPriceRange = async (req, res, next) => {
  try {
    const userID = req.userId;
    const { groupId } = req.params;
    if (!groupId) throw new customError("Group Id Required", 400);
    const { range } = req.query;
    if (!range) {
      const priceRange1D = await read_GroupPriceRange1D(groupId, userID);
      return res.status(200).json({
        success: true,
        message: "1D Price Range",
        data: priceRange1D,
      });
    }

    const currentDate = new Date();

    if (range === "W") {
      const oneWeekAgo = new Date(currentDate);
      oneWeekAgo.setDate(currentDate.getDate() - 7);
      const priceRange = await read_GroupPriceRange(
        groupId,
        userID,
        oneWeekAgo,
      );
      return res.status(200).json({
        success: true,
        message: "W Price Range",
        data: priceRange,
      });
    }

    if (range === "M") {
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);
      const priceRange = await read_GroupPriceRange(
        groupId,
        userID,
        oneMonthAgo,
      );
      return res.status(200).json({
        success: true,
        message: "M Price Range",
        data: priceRange,
      });
    }

    if (range === "Y") {
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      const priceRange = await read_GroupPriceRange(
        groupId,
        userID,
        oneYearAgo,
      );
      return res.status(200).json({
        success: true,
        message: "Y Price Range",
        data: priceRange,
      });
    }

    if (range === "3Y") {
      const threeYearsAgo = new Date(currentDate);
      threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);
      const priceRange = await read_GroupPriceRange(
        groupId,
        userID,
        threeYearsAgo,
      );
      return res.status(200).json({
        success: true,
        message: "3Y Price Range",
        data: priceRange,
      });
    }

    if (range === "MAX") {
      const priceRange = await read_GroupPriceRange(groupId, userID);
      return res.status(200).json({
        success: true,
        message: "MAX Price Range",
        data: priceRange,
      });
    }

    throw new customError("Invalid Request", 400);
  } catch (error) {
    next(error);
  }
};

module.exports.priceRange = async (req, res, next) => {
  try {
    const { securityId } = req.params;
    if (!securityId) throw new customError("Security Id Required", 400);
    const { range } = req.query;
    if (!range) {
      const priceRange1D = await read_PriceRange1D(securityId);
      return res.status(200).json({
        success: true,
        message: "1D Price Range",
        data: priceRange1D,
      });
    }

    const currentDate = new Date();

    if (range === "W") {
      const oneWeekAgo = new Date(currentDate);
      oneWeekAgo.setDate(currentDate.getDate() - 7);
      const priceRange = await read_PriceRange(securityId, oneWeekAgo);
      return res.status(200).json({
        success: true,
        message: "W Price Range",
        data: priceRange,
      });
    }

    if (range === "M") {
      const oneMonthAgo = new Date(currentDate);
      oneMonthAgo.setMonth(currentDate.getMonth() - 1);
      const priceRange = await read_PriceRange(securityId, oneMonthAgo);
      return res.status(200).json({
        success: true,
        message: "M Price Range",
        data: priceRange,
      });
    }

    if (range === "Y") {
      const oneYearAgo = new Date(currentDate);
      oneYearAgo.setFullYear(currentDate.getFullYear() - 1);
      const priceRange = await read_PriceRange(securityId, oneYearAgo);
      return res.status(200).json({
        success: true,
        message: "Y Price Range",
        data: priceRange,
      });
    }

    if (range === "3Y") {
      const threeYearsAgo = new Date(currentDate);
      threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);
      const priceRange = await read_PriceRange(securityId, threeYearsAgo);
      return res.status(200).json({
        success: true,
        message: "3Y Price Range",
        data: priceRange,
      });
    }

    if (range === "MAX") {
      const priceRange = await read_PriceRange(securityId);
      return res.status(200).json({
        success: true,
        message: "MAX Price Range",
        data: priceRange,
      });
    }

    throw new customError("Invalid Request", 400);
  } catch (error) {
    next(error);
  }
};
