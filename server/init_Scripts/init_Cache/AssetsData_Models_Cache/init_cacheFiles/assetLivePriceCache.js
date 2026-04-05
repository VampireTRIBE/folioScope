const {
  getLatestCloses,
} = require("../../../../utils/Portfolio_Models_utils/aggregationPipeline/getMarketPrice");
let assetMetadataLivePriceCache = {};

module.exports.setAssetMetadataLivePriceCache = async () => {
  assetMetadataLivePriceCache = await getLatestCloses();
};

module.exports.getLiveMarketAssetIdPriceMAP = () => {
  return Object.freeze(assetMetadataLivePriceCache);
};
