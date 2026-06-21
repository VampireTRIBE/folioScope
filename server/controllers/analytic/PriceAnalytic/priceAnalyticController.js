const mongoose = require("mongoose");

// ! MODELS
const PORTFOLIOGROUP_MODEL = require("../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");

// ! Analytic Utils
const {
  priceDrawdownAnalysis,
} = require("../../../utils/analytics/NonComparisonAnalytics/PRICE_Drawdown_Analytics");
const {
  XIRR_Group,
} = require("../../../utils/analytics/NonComparisonAnalytics/XIRR_Calculation");
const {
  default_XirrComparison,
} = require("../../../utils/analytics/ComparisonAnalytics/default_XirrComparison");
const {
  default_NavComparison,
} = require("../../../utils/analytics/ComparisonAnalytics/default_NavComparison");

// ! Other Utils
const customError = require("../../../utils/shared/error/customError");

module.exports.priceSecurityDrawdownAnalytic = async (req, res, next) => {
  try {
    const { securityId } = req.params;
    if (!securityId) throw new customError("Security Id Required", 400);
    const priceDrawdown = await priceDrawdownAnalysis({
      assetId: securityId,
      startDate: "2021-05-19T10:30:00.000+00:00",
    });
    const [key] = Object.keys(priceDrawdown);

    res.status(200).json({
      success: true,
      message: "Price Drawdown Analysis",
      data: priceDrawdown?.[key] ?? null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.priceGroupDrawdownAnalytic = async (req, res, next) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;

    const { groupId } = req.params;
    if (!groupId) throw new customError("groupId Id Required", 400);

    const priceDrawdown = await priceDrawdownAnalysis({
      assetId: groupId,
      startDate: "2021-05-19T10:30:00.000+00:00",
      nav: true,
      userID,
    });
    const [key] = Object.keys(priceDrawdown);

    res.status(200).json({
      success: true,
      message: "Price Drawdown Analysis",
      data: priceDrawdown?.[key] ?? null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.xirrAnalytic = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const userID = req.userId;
    const { groupId } = req.params;
    if (!groupId) throw new customError("groupId Id Required", 400);
    let xirr = null;

    await session.withTransaction(async () => {
      const portfolioGroup = await PORTFOLIOGROUP_MODEL.findOne({
        _id: groupId,
        userId: userID,
      }).session(session);

      if (!portfolioGroup) {
        throw new customError("Group not found or unauthorized", 404);
      }

      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const cachedXirr = portfolioGroup.groupSnapshot?.groupXirr;
      const lastComputed = cachedXirr?.lastcomputed;
      const shouldRecompute =
        !lastComputed ||
        Date.now() - new Date(lastComputed).getTime() > ONE_DAY_MS;

      if (shouldRecompute) {
        const groupXirr = await XIRR_Group(groupId, userID, session);
        portfolioGroup.set("groupSnapshot.groupXirr", {
          xirr: groupXirr,
          lastcomputed: new Date(),
        });
        portfolioGroup.$locals.parent = "xirr";
        await portfolioGroup.save({ session });
      }
      xirr = portfolioGroup.groupSnapshot.groupXirr.xirr;
    });

    res.status(200).json({
      success: true,
      message: "Group Xirr Analysis",
      data: xirr,
    });
  } catch (error) {
    next(error);
  } finally {
    session.endSession();
  }
};

module.exports.xirrComparison = async (req, res, next) => {
  try {
    const userID = req.userId;
    const { groupId } = req.params;
    const { indexId } = req.params;
    if (!groupId || !indexId)
      throw new customError("Missing Request Credentials", 400);

    const XirrComparision = await default_XirrComparison(
      groupId,
      userID,
      indexId,
    );

    res.status(200).json({
      success: true,
      message: "Xirr Comparision Analysis",
      data: XirrComparision,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.navComparison = async (req, res, next) => {
  try {
    const userID = req.userId;
    const { groupId } = req.params;
    const { indexId } = req.params;
    if (!groupId || !indexId)
      throw new customError("Missing Request Credentials", 400);

    const XirrComparision = await default_NavComparison({
      indexId,
      groupId,
      userId: userID,
      startDate: new Date("2024-06-26T06:45:00.000+00:00"),
    });

    res.status(200).json({
      success: true,
      message: "Xirr Comparision Analysis",
      data: XirrComparision,
    });
  } catch (error) {
    next(error);
  }
};
