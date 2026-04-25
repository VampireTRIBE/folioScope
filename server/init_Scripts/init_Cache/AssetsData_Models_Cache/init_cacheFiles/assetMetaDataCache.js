let assetMetaDataCache = {
  assetMetaDataID: null,
  assetMetaDataName: null,
  AssetMetaDataGFTickerName: {},
  AssetMetaDataGFTickerID: {},
};

module.exports.set_AssetMetaDataCache = (
  assetmetadataID,
  assetmetadataName,
) => {
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

module.exports.get_AssetMetaDataID = () => {
  return assetMetaDataCache.assetMetaDataID;
};

module.exports.get_AssetMetaDataName = () => {
  return assetMetaDataCache.assetMetaDataName;
};

module.exports.get_SingleAssetMetaDataID = (id) => {
  return assetMetaDataCache.assetMetaDataID?.[id];
};

module.exports.get_SingleAssetMetaDataName = (name) => {
  return assetMetaDataCache.assetMetaDataName?.[name];
};

module.exports.get_AssetMetaDataGFTickerName = () => {
  return assetMetaDataCache.AssetMetaDataGFTickerName;
};
module.exports.get_AssetMetaDataGFTickerID = () => {
  return assetMetaDataCache.AssetMetaDataGFTickerID;
};

module.exports.get_SingleAssetMetaDataGFTickerName = (name) => {
  return assetMetaDataCache.AssetMetaDataGFTickerName?.[name];
};

module.exports.get_SingleAssetMetaDataGFTickerID = (id) => {
  return assetMetaDataCache.AssetMetaDataGFTickerName?.[id];
};
