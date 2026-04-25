const {
  fetch_CurrentPrice,
} = require("../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/fetch_CurrentPriceScript");

const TIME_INTERVEL = 3 * 60 * 1000;
module.exports.sync_CurrentPrices = async () => {
  await fetch_CurrentPrice();
  setTimeout(sync_CurrentPrices, TIME_INTERVEL);
};
