const {
  initLivePriceTicker,
  initPastPrice,
} = require("./init_appscriptFiles/init_livePriceTicker");

module.exports.initAppscriptMaster = async () => {
  try {
    await Promise.all([initLivePriceTicker(), initPastPrice()]);
    return { result: true };
  } catch (error) {
    return { result: false };
  }
};
