const {
  fetch_CurrentPrice,
} = require("../init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/fetch_CurrentPriceScript");

const TIME_INTERVEL = 5000;
const sync_CurrentPrices = async () => {
  await fetch_CurrentPrice();
  setTimeout(sync_CurrentPrices, TIME_INTERVEL);
};

module.exports = { sync_CurrentPrices };
