const {
  initLivePrice,
  initPastPrice,
} = require("./initAppscript/init_livePriceScript");

module.exports.initAppscriptMaster = async () => {
  try {
    await Promise.all([initLivePrice(), initPastPrice()]);
    return { result: true };
  } catch (error) {
    console.log(error);
    return { result: false };
  }
};
