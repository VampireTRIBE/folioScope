let assetMetaDataCache = {
  assetMetaDataID: null,
  assetMetaDataName: null,
  AssetMetaDataGFTickerName: {},
  AssetMetaDataGFTickerID: {},
};

module.exports.setAssetMetaDataCache = (assetmetadataID, assetmetadataName) => {
  assetMetaDataCache.assetMetaDataID = assetmetadataID;
  assetMetaDataCache.assetMetaDataName = assetmetadataName;

  for (const obj of Object.keys(assetmetadataName)) {
    assetMetaDataCache.AssetMetaDataGFTickerName[obj] =
      assetmetadataName[obj].GF_TickerCode;
  }

  for (const obj of Object.keys(assetmetadataID)) {
    assetMetaDataCache.AssetMetaDataGFTickerID[obj] =
      assetmetadataID[obj].GF_TickerCode;
  }
};

module.exports.getAssetMetaDataID = () => {
  return assetMetaDataCache.assetMetaDataID;
};

module.exports.getAssetMetaDataName = () => {
  return assetMetaDataCache.assetMetaDataName;
};

module.exports.getSingleAssetMetaDataID = (id) => {
  return assetMetaDataCache.assetMetaDataID?.[id];
};

module.exports.getSingleAssetMetaDataName = (name) => {
  return assetMetaDataCache.assetMetaDataName?.[name];
};

module.exports.getAssetMetaDataGFTickerName = () => {
  return assetMetaDataCache.AssetMetaDataGFTickerName;
};
module.exports.getAssetMetaDataGFTickerID = () => {
  return assetMetaDataCache.AssetMetaDataGFTickerID;
};

module.exports.getSingleAssetMetaDataGFTickerName = (name) => {
  return assetMetaDataCache.AssetMetaDataGFTickerName?.[name];
};

module.exports.getSingleAssetMetaDataGFTickerID = (id) => {
  return assetMetaDataCache.AssetMetaDataGFTickerName?.[id];
};
