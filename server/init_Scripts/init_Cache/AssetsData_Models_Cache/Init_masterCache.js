const {
  build_AssetClass_TreeStructure,
  build_AssetSector_TreeStructure,
  build_AssetAMC_TreeStructure,
  build_AssetMetaData,
} = require("../../../utils/mongodb/aggregations/build_classificationStructure");
const {
  assetClassClassification_StructureID,
  assetSectorClassification_StructureID,
  assetAMCClassification_StructureID,
  assetClassClassification_StructureName,
  assetSectorClassification_StructureName,
  assetAMCClassification_StructureName,
  assetMetaDataID,
  assetMetaDataName,
} = require("../../../utils/transformData/build_AggregationStructure");
const {
  set_AssetClassificationCache,
} = require("./init_cacheFiles/assetClassificationCache");
const {
  set_AssetMetaDataCache,
} = require("./init_cacheFiles/assetMetaDataCache");

module.exports.init_CacheAssetDataStructure = async () => {
  const [assetClassResult, assetSectorResult, assetAMCResult] =
    await Promise.all([
      build_AssetClass_TreeStructure(),
      build_AssetSector_TreeStructure(),
      build_AssetAMC_TreeStructure(),
    ]);

  const [
    assetClassIDStructure,
    assetSectorIDStructure,
    assetAMCIDStructure,
    assetClassNameStructure,
    assetSectorNameStructure,
    assetAMCNameStructure,
  ] = await Promise.all([
    assetClassClassification_StructureID(assetClassResult),
    assetSectorClassification_StructureID(assetSectorResult),
    assetAMCClassification_StructureID(assetAMCResult),
    assetClassClassification_StructureName(assetClassResult),
    assetSectorClassification_StructureName(assetSectorResult),
    assetAMCClassification_StructureName(assetAMCResult),
  ]);
  const nameMap = {};
  for (const key of Object.keys(assetClassIDStructure)) {
    nameMap[assetClassIDStructure[key].name] = key;
  }
  set_AssetClassificationCache(
    nameMap,
    assetClassIDStructure,
    assetClassNameStructure,
    assetSectorIDStructure,
    assetSectorNameStructure,
    assetAMCIDStructure,
    assetAMCNameStructure,
  );
};

module.exports.init_CacheAssetMetaData = async () => {
  const assetMetaDataResult = await build_AssetMetaData();
  const [assetmetadataID, assetmetadataName] = await Promise.all([
    assetMetaDataID(assetMetaDataResult),
    assetMetaDataName(assetMetaDataResult),
  ]);
  set_AssetMetaDataCache(assetmetadataID, assetmetadataName);
};

module.exports.init_CacheMaster = async () => {
  try {
    await this.init_CacheAssetDataStructure();
    await this.init_CacheAssetMetaData();
    return { result: true };
  } catch (error) {
    return { result: false };
  }
};
