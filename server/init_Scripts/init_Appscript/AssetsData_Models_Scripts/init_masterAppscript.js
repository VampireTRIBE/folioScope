const { setAssetMetadataLivePriceCache } = require("../../init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetLivePriceCache");
const {
  initLivePriceTicker,
  initPastPrice,
} = require("./init_appscriptFiles/init_livePriceTicker");

module.exports.initAppscriptMaster = async () => {
  try {
    await Promise.all([initLivePriceTicker(), initPastPrice()]);
    await setAssetMetadataLivePriceCache();
    return { result: true };
  } catch (error) {
    return { result: false };
  }
};
