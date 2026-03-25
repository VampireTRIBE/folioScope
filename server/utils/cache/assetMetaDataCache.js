let assetMetaDataCache = {
  assetMetaDataID: null,
  assetMetaDataName: null,
};

module.exports.setAssetMetaDataCache = (assetmetadataID, assetmetadataName) => {
  assetMetaDataCache.assetMetaDataID = assetmetadataID;
  assetMetaDataCache.assetMetaDataName = assetmetadataName;
};

module.exports.getAssetMetaDataID = () => {
  return Object.freeze(assetMetaDataCache.assetMetaDataID);
};

module.exports.getAssetMetaDataName = () => {
  return Object.freeze(assetMetaDataCache.assetMetaDataName);
};

module.exports.getSingleAssetMetaDataID = (id) => {
  console.log("id");
  return Object.freeze(assetMetaDataCache.assetMetaDataID?.[id]);
};

module.exports.getSingleAssetMetaDataName = (name) => {
  return Object.freeze(assetMetaDataCache.assetMetaDataName?.[name]);
};
