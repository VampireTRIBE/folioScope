let assetClassificationCache = {
  NAMEIDMAP: null,
  assetClassificationStructureName: null,
  assetSectorName: null,
  assetAMCName: null,
  assetClassificationStructureID: null,
  assetSectorID: null,
  assetAMCID: null,
};

module.exports.set_AssetClassificationCache = (
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

module.exports.get_NAMEIDMAP = () => {
  return Object.freeze(assetClassificationCache.NAMEIDMAP);
};

module.exports.get_AssetClassificationStructureID = () => {
  return Object.freeze(assetClassificationCache.assetClassificationStructureID);
};

module.exports.get_AssetClassificationStructureName = () => {
  return Object.freeze(
    assetClassificationCache.assetClassificationStructureName,
  );
};

module.exports.get_SectorClasificationStructureID = () => {
  return Object.freeze(assetClassificationCache.assetSectorID);
};

module.exports.get_SectorClassificationStructureName = () => {
  return Object.freeze(assetClassificationCache.assetSectorName);
};

module.exports.get_AMCClasificationStructureID = () => {
  return Object.freeze(assetClassificationCache.assetAMCID);
};

module.exports.get_AMCClassificationStructureName = () => {
  return Object.freeze(assetClassificationCache.assetAMCName);
};
