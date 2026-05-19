const {
  priceDrawdownAnalysis,
} = require("../../../utils/analytics/NonComparisionAnalytics/PRICE_Drawdown_Analytics");

module.exports.priceDrawdownAnalytic = async (req, res, next) => {
  try {
    const priceDrawdown = await priceDrawdownAnalysis({
      startDate: "2021-05-19T10:30:00.000+00:00",
    });

    res.status(200).json({
      success: true,
      message: "Price Drawdown Analysis",
      analytics: { ...priceDrawdown },
    });
  } catch (error) {
    next(error);
  }
};
