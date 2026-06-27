const {
  get_NAMEIDMAP,
} = require("../../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

const {
  get_AssetMetaDataName,
} = require("../../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

const customError = require("../../../../shared/error/customError");

const {
  get_leafGroupID_NameByGroup,
} = require("../../get_leafGroupIDsByGroup");

const {
  get_RebalancerListByUserId,
} = require("../../get_RebalancerListByuserId");

// ===============================
// Build Tradable Securities Map
// ===============================

const buildTradableSecuritiesMap = () => {
  const allSecuritiesListData = get_AssetMetaDataName();
  const assetClassList = get_NAMEIDMAP();

  const tradableSecurities = {};
  const indexAssetClassId = String(assetClassList?.INDEX || "");

  for (const [securityKey, securityValue] of Object.entries(
    allSecuritiesListData || {},
  )) {
    const assetId = String(securityValue?._id || "");
    const assetClassId = String(securityValue?.assetClass || "");

    if (!assetId) continue;

    // Exclude INDEX asset class
    if (assetClassId !== indexAssetClassId) {
      tradableSecurities[assetId] = securityKey;
    }
  }

  return tradableSecurities;
};

// ===============================
// Validate + Build Clean Payload
// ===============================

module.exports.validate_NewRebalancer_ReqData = async (data) => {
  try {
    const tradableSecurities = buildTradableSecuritiesMap();

    const [leafGroups, rebalancerListGroupIds] = await Promise.all([
      get_leafGroupID_NameByGroup(data.portfolioGroupId, data.userId),
      get_RebalancerListByUserId(data.userId),
    ]);

    const cleanAssets = [];
    const selectedAssetIds = new Set();

    // ===============================
    // Validate Main Assets
    // ===============================

    for (const asset of data.assets || []) {
      const assetId = String(asset.assetId);
      const groupId = String(asset.groupId);

      const assetName = tradableSecurities[assetId];

      if (!assetName) {
        throw new customError("Invalid Asset", 400);
      }

      const groupName = leafGroups[groupId];

      if (!groupName) {
        throw new customError("Invalid group", 400);
      }

      if (rebalancerListGroupIds[groupId]) {
        throw new customError("This group is part of another Rebalancer", 400);
      }

      selectedAssetIds.add(assetId);

      cleanAssets.push({
        assetId,
        assetName,
        groupId,
        groupName,
        targetWeight: Number(asset.targetWeight),
        band: Number(asset.band),
        multiplier: Number(asset.multiplier || 1),
      });
    }

    // ===============================
    // Validate Market Fall Rules
    // ===============================

    const cleanMarketFallRules = [];

    for (const rule of data.marketFallRules || []) {
      const cleanRuleAssets = [];

      for (const asset of rule.assets || []) {
        const assetId = String(asset.assetId);

        const assetName = tradableSecurities[assetId];

        if (!assetName) {
          throw new customError("Invalid Market Fall Asset", 400);
        }

        if (!selectedAssetIds.has(assetId)) {
          throw new customError(
            "Market fall asset must exist inside main assets",
            400,
          );
        }

        cleanRuleAssets.push({
          assetId,
          assetName,
          multiplier: Number(asset.multiplier || 1),
          min: Number(asset.min || 0.15),
        });
      }

      cleanMarketFallRules.push({
        fallPercentage: Number(rule.fallPercentage),
        deployPercentage: Number(rule.deployPercentage),
        assets: cleanRuleAssets,
      });
    }

    // ===============================
    // Final Clean Payload For DB
    // ===============================

    return {
      userId: data.userId,
      portfolioGroupId: data.portfolioGroupId,
      rebalancerName: data.rebalancerName,
      rebalancerDescription: data.rebalancerDescription || "",
      assets: cleanAssets,
      marketFallRules: cleanMarketFallRules,
    };
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }

    throw new customError(
      error.message || "New rebalancer request validation failed",
      error.statusCode || error.status || 500,
    );
  }
};
