const {
  buildAssetClassTreeStructure,
  buildAssetSectorTreeStructure,
  buildAssetAMCTreeStructure,
} = require("../utils/aggregation/seeder_Aggregations/assetMetaDataAggregate");
const {
  setAssetClassificationCache,
} = require("../utils/cache/assetClassificationCache");
const {
  assetClassClassificationStructureID,
  assetSectorClassificationStructureID,
  assetAMCClassificationStructureID,
  assetClassClassificationStructureName,
  assetSectorClassificationStructureName,
  assetAMCClassificationStructureName,
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

module.exports.initCacheMaster = async () => {
  try {
    await initCacheAssetDataStructure();
    return { result: true };
  } catch (error) {
    return { result: false };
  }
};
