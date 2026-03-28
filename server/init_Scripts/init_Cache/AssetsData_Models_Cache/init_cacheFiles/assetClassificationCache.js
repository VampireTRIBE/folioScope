let assetClassificationCache = {
  NAMEIDMAP: null,
  assetClassificationStructureName: null,
  assetSectorName: null,
  assetAMCName: null,
  assetClassificationStructureID: null,
  assetSectorID: null,
  assetAMCID: null,
};

module.exports.setAssetClassificationCache = (
  nameMap,
  assetClassID,
  assetClassName,
  assetSectorID,
  assetSectorName,
  assetAMCID,
  assetAMCName,
) => {
  assetClassificationCache.NAMEIDMAP = nameMap;
  assetClassificationCache.assetClassificationStructureID = assetClassID;
  assetClassificationCache.assetClassificationStructureName = assetClassName;
  assetClassificationCache.assetSectorID = assetSectorID;
  assetClassificationCache.assetSectorName = assetSectorName;
  assetClassificationCache.assetAMCID = assetAMCID;
  assetClassificationCache.assetAMCName = assetAMCName;
};

module.exports.getNAMEIDMAP = () => {
  return Object.freeze(assetClassificationCache.NAMEIDMAP);
};

module.exports.getAssetClassificationStructureID = () => {
  return Object.freeze(assetClassificationCache.assetClassificationStructureID);
};

module.exports.getAssetClassificationStructureName = () => {
  return Object.freeze(
    assetClassificationCache.assetClassificationStructureName,
  );
};

module.exports.getSectorClasificationStructureID = () => {
  return Object.freeze(assetClassificationCache.assetSectorID);
};

module.exports.getSectorClassificationStructureName = () => {
  return Object.freeze(assetClassificationCache.assetSectorName);
};

module.exports.getAMCClasificationStructureID = () => {
  return Object.freeze(assetClassificationCache.assetAMCID);
};

module.exports.getAMCClassificationStructureName = () => {
  return Object.freeze(assetClassificationCache.assetAMCName);
};
