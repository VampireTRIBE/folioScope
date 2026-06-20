const mongoose = require("mongoose");
const PORTFOLIOGROUP_MODEL = require("../../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const {
  priceDrawdownAnalysis,
} = require("../../../utils/analytics/NonComparisonAnalytics/PRICE_Drawdown_Analytics");
const {
  XIRR_Group,
} = require("../../../utils/analytics/NonComparisonAnalytics/XIRR_Calculation");
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
    console.log(error);
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
