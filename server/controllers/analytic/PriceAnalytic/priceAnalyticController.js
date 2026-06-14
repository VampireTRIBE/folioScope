const {
  priceDrawdownAnalysis,
} = require("../../../utils/analytics/NonComparisonAnalytics/PRICE_Drawdown_Analytics");
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
