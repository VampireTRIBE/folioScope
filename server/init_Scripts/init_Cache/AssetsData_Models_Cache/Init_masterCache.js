const {
  buildAssetClass_TreeStructure,
  buildAssetSector_TreeStructure,
  buildAssetAMC_TreeStructure,
  buildAssetMetaData,
} = require("../../../utils/AssetData_Models_utils/aggregations/DB_Queries");
const {
  assetClassClassification_StructureID,
  assetSectorClassification_StructureID,
  assetAMCClassification_StructureID,
  assetClassClassification_StructureName,
  assetSectorClassification_StructureName,
  assetAMCClassification_StructureName,
  assetMetaDataID,
  assetMetaDataName,
} = require("../../../utils/AssetData_Models_utils/helpers/transformStructure/transformAggrigation");
const {
  setAssetClassificationCache,
} = require("./init_cacheFiles/assetClassificationCache");
const {
  setAssetMetadataLivePriceCache,
} = require("./init_cacheFiles/assetLivePriceCache");
const {
  setAssetMetaDataCache,
} = require("./init_cacheFiles/assetMetaDataCache");

module.exports.initCacheAssetDataStructure = async () => {
  const [assetClassResult, assetSectorResult, assetAMCResult] =
    await Promise.all([
      buildAssetClass_TreeStructure(),
      buildAssetSector_TreeStructure(),
      buildAssetAMC_TreeStructure(),
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
  setAssetClassificationCache(
    nameMap,
    assetClassIDStructure,
    assetClassNameStructure,
    assetSectorIDStructure,
    assetSectorNameStructure,
    assetAMCIDStructure,
    assetAMCNameStructure,
  );
};

module.exports.initCacheAssetMetaData = async () => {
  const assetMetaDataResult = await buildAssetMetaData();
  const [assetmetadataID, assetmetadataName] = await Promise.all([
    assetMetaDataID(assetMetaDataResult),
    assetMetaDataName(assetMetaDataResult),
  ]);
  setAssetMetaDataCache(assetmetadataID, assetmetadataName);
};

module.exports.initCacheMaster = async () => {
  try {
    await this.initCacheAssetDataStructure();
    await this.initCacheAssetMetaData();
    // await setAssetMetadataLivePriceCache();
    return { result: true };
  } catch (error) {
    return { result: false };
  }
};
