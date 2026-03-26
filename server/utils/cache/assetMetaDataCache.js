let assetMetaDataCache = {
  assetMetaDataID: null,
  assetMetaDataName: null,
  assetMetaDataList: null,
};

module.exports.setAssetMetaDataCache = (assetmetadataID, assetmetadataName) => {
  assetMetaDataCache.assetMetaDataID = assetmetadataID;
  assetMetaDataCache.assetMetaDataName = assetmetadataName;
  assetMetaDataCache.assetMetaDataList = Object.freeze(
    Object.keys(assetmetadataName),
  );
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

module.exports.getAssetMetadatalist = () => {
  return assetMetaDataCache.assetMetaDataList;
};
