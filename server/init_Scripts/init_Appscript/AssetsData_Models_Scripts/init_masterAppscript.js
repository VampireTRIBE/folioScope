const {
  init_LivePriceTicker,
  init_PastPrices,
} = require("./init_appscriptFiles/init_livePriceTicker");

module.exports.init_AppscriptMaster = async () => {
  try {
    await Promise.all([init_LivePriceTicker(), init_PastPrices()]);
    return { result: true };
  } catch (error) {
    return { result: false };
  }
};
