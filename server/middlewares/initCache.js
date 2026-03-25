const {
  buildAssetClassTreeStructure,
  buildAssetSectorTreeStructure,
  buildAssetAMCTreeStructure,
  buildAssetMetaData,
} = require("../utils/aggregation/seeder_Aggregations/assetMetaDataAggregate");
const {
  setAssetClassificationCache,
} = require("../utils/cache/assetClassificationCache");
const { setAssetMetaDataCache } = require("../utils/cache/assetMetaDataCache");
const {
  assetClassClassificationStructureID,
  assetSectorClassificationStructureID,
  assetAMCClassificationStructureID,
  assetClassClassificationStructureName,
  assetSectorClassificationStructureName,
  assetAMCClassificationStructureName,
  assetMetaDataID,
  assetMetaDataName,
} = require("../utils/others_helpers/assetClassificationStructureAggrigation");

const initCacheAssetDataStructure = async () => {
  const [assetClassResult, assetSectorResult, assetAMCResult] =
    await Promise.all([
      buildAssetClassTreeStructure(),
      buildAssetSectorTreeStructure(),
      buildAssetAMCTreeStructure(),
    ]);

  const [
    assetClassIDStructure,
    assetSectorIDStructure,
    assetAMCIDStructure,
    assetClassNameStructure,
    assetSectorNameStructure,
    assetAMCNameStructure,
  ] = await Promise.all([
    assetClassClassificationStructureID(assetClassResult),
    assetSectorClassificationStructureID(assetSectorResult),
    assetAMCClassificationStructureID(assetAMCResult),
    assetClassClassificationStructureName(assetClassResult),
    assetSectorClassificationStructureName(assetSectorResult),
    assetAMCClassificationStructureName(assetAMCResult),
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

const initCacheAssetMetaData = async () => {
  const assetMetaDataResult = await buildAssetMetaData();

  const [assetmetadataID, assetmetadataName] = await Promise.all([
    assetMetaDataID(assetMetaDataResult),
    assetMetaDataName(assetMetaDataResult),
  ]);
  setAssetMetaDataCache(assetmetadataID, assetmetadataName);
};

module.exports.initCacheMaster = async () => {
  try {
    await initCacheAssetDataStructure();
    await initCacheAssetMetaData();
    return { result: true };
  } catch (error) {
    return { result: false };
  }
};
