const mongoose = require("mongoose");

// ! Utils
const customError = require("../../../../shared/error/customError");

const {
  get_AllFinancialAssetWithCurrentValue,
} = require("../../get_financialAssets");

const {
  get_SingleAssetMetaDataID,
  get_SingleAssetMetaDataName,
} = require("../../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

const { getAssetPriceStatsByIds } = require("../../get_AssetsPrice");

// ======================================================
// Helpers
// ======================================================

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const roundNumber = (value, decimals = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Number(num.toFixed(decimals));
};

const calculatePnlPercentage = (currentValue = 0, investedValue = 0) => {
  currentValue = toNumber(currentValue);
  investedValue = toNumber(investedValue);

  if (investedValue <= 0) return 0;

  return ((currentValue - investedValue) / investedValue) * 100;
};

const createGroupLevelData = () => ({
  meta: {
    groupName: "",
    targetWeight: 0,
    band: 0,
    upperLimit: 0,
    lowerLimit: 0,
  },
  position: {
    currentValue: 0,
    investedValue: 0,
    price: {
      price: 0,
      today: 0,
    },
  },
  metrics: {
    currentWeight: 0,
    driftPercentage: 0,
    driftAmount: 0,
    status: "",
  },
});

const createAssetLevelData = () => ({
  meta: {
    assetName: "",
    relativeBand: 0,
    multiplier: 0,
    discountFactor: 1,
    groupName: "",
    groupId: "",
    targetWeight: 0,
    band: 0,
    upperLimit: 0,
    lowerLimit: 0,
    isCashReserve: false,
  },
  position: {
    currentValue: 0,
    investedValue: 0,
    price: {
      price: 0,
      today: 0,
    },
  },
  metrics: {
    currentWeight: 0,
    driftPercentage: 0,
    driftAmount: 0,
    status: "",
    sipScore: 0,
    lumpsumScore: 0,
    sipAmount: 0,
    lumpsumAmount: 0,
  },
});

const getDiscountFactor = (pnlPercentage = 0) => {
  const numericPnl = Number(pnlPercentage) || 0;

  return Math.min(
    1.35,
    numericPnl < -0.07 ? 1 + (Math.abs(numericPnl) - 0.07) * 1.5 : 1,
  );
};

const createFallDeploymentAssetData = () => ({
  assetId: "",
  assetName: "",
  multiplier: 1,
  min: 0.15,

  score: 0,
  deployAmount: 0,

  maxPrice: 0,
  currentPrice: 0,
  fallPercentage: 0,
});

const createDeployementFallData = () => ({
  deploymeta: {
    fallPercentage: 0,
    deployPercentage: 0,
    deployAmount: 0,
    shotNumber: 0,
    lastDeployed: null,

    isTriggered: false,
    action: "",
    status: "",
    isLocked: false,
  },

  benchmark: {
    benchmarkname: "NIFTY 50",
    benchmarkId: "",
    maxPrice: 0,
    currentPrice: 0,
    fallPercentage: 0,
  },

  assets: [],

  totalTeirscore: 0,
});

// ======================================================
// SIP Score
// ======================================================

const calculateSipScore = ({
  targetWeight = 0,
  band = 0,
  driftPercentage = 0,
  multiplier = 1,
  discountFactor = 1,
  status = "",
}) => {
  targetWeight = toNumber(targetWeight);
  band = toNumber(band);
  driftPercentage = toNumber(driftPercentage);
  multiplier = toNumber(multiplier, 1);
  discountFactor = toNumber(discountFactor, 1);

  if (driftPercentage >= 0 || status === "EXTREME OVER WEIGHT") {
    return 0;
  }

  if (band <= 0) {
    return 0;
  }

  return (
    targetWeight *
    (Math.abs(driftPercentage) / band) *
    multiplier *
    discountFactor
  );
};

// ======================================================
// Asset Lookup
// ======================================================

const getGroupIdByAssetId = (assets = [], assetId) => {
  if (!Array.isArray(assets)) {
    throw new Error("assets must be an array");
  }

  if (!assetId) {
    throw new Error("assetId is required");
  }

  const asset = assets.find(
    (item) => item?.assetId?.toString() === assetId.toString(),
  );

  return asset?.groupId?.toString() || null;
};

// ======================================================
// Market Fall Score
// ======================================================

const calculateMarketFallScore = ({
  assets = [],
  assetName,
  groupId,
  multiplier = 1,
  minScoreFactor = 0.15,
  assetFallPercentage = 0,
  benchmarkFallPercentage = 0,
}) => {
  if (!Array.isArray(assets)) {
    throw new Error("assets must be an array");
  }

  benchmarkFallPercentage = toNumber(benchmarkFallPercentage);

  if (benchmarkFallPercentage <= 0) {
    return 0;
  }

  const asset = assets.find((item) => {
    const sameAsset = item?.meta?.assetName === assetName;

    if (groupId) {
      return sameAsset && item?.meta?.groupId?.toString() === groupId.toString();
    }

    return sameAsset;
  });

  if (!asset) {
    throw new Error(`Asset not found: ${assetName}`);
  }

  const targetWeight = toNumber(asset?.meta?.targetWeight);
  const currentWeight = toNumber(asset?.metrics?.currentWeight);
  const driftGap = targetWeight - currentWeight;

  const score =
    targetWeight *
    Math.max(toNumber(minScoreFactor), driftGap) *
    toNumber(multiplier, 1) *
    (toNumber(assetFallPercentage) / benchmarkFallPercentage);

  return roundNumber(score, 2);
};

// ======================================================
// Deployment State Calculator
// ======================================================

const updateDeploymentMetaStatus = ({
  deployRule,
  currentIndex,
  allRules,
  benchmarkFall,
}) => {
  const firstRule = allRules[0];
  const lastIndex = allRules.length - 1;

  const nextDeployTier =
    currentIndex < lastIndex ? allRules[currentIndex + 1] : null;

  const prevDeployTier = currentIndex > 0 ? allRules[currentIndex - 1] : null;

  const triggerFall = toNumber(deployRule.deploymeta.fallPercentage);
  const shotNumber = toNumber(deployRule.deploymeta.shotNumber);

  // Benchmark has not reached first deployment level
  if (benchmarkFall < toNumber(firstRule.deploymeta.fallPercentage)) {
    deployRule.deploymeta.isTriggered = false;
    deployRule.deploymeta.action = "No Deploy Action Needed";
    deployRule.deploymeta.status = "Normal SIP";
    return;
  }

  // Locked state
  if (deployRule.deploymeta.isLocked) {
    deployRule.deploymeta.isTriggered = false;
    deployRule.deploymeta.action = "No Deploy Action Needed";

    if (shotNumber === 1) {
      deployRule.deploymeta.status =
        currentIndex === 0
          ? "Locked Until Benchmark Reaches ATH Again"
          : "Locked Until Benchmark Reaches Previous Deployment Tier Again";
      return;
    }

    if (shotNumber === 2) {
      if (prevDeployTier) {
        const unlockPrice =
          deployRule.benchmark.maxPrice -
          (deployRule.benchmark.maxPrice *
            toNumber(prevDeployTier.deploymeta.fallPercentage)) /
            100;

        deployRule.deploymeta.status = `Locked Until Benchmark Reaches Again At ${roundNumber(
          unlockPrice,
          2,
        )}`;
      } else {
        deployRule.deploymeta.status = "Locked Until Benchmark Reaches ATH Again";
      }

      return;
    }

    if (shotNumber >= 3) {
      deployRule.deploymeta.status = "Locked Until Benchmark Reaches ATH Again";
      return;
    }

    deployRule.deploymeta.status = "Locked";
    return;
  }

  // All shots completed
  if (shotNumber >= 3) {
    deployRule.deploymeta.isTriggered = false;
    deployRule.deploymeta.action = "No Deploy Action Needed";
    deployRule.deploymeta.status = "All Deployment Shots Completed";
    return;
  }

  const isInsideCurrentTier = nextDeployTier
    ? benchmarkFall >= triggerFall &&
      benchmarkFall < toNumber(nextDeployTier.deploymeta.fallPercentage)
    : benchmarkFall >= triggerFall;

  if (isInsideCurrentTier) {
    deployRule.deploymeta.isTriggered = true;
    deployRule.deploymeta.action = "Deploy Action Needed";
    deployRule.deploymeta.status = "Not Deployed Yet";
    return;
  }

  deployRule.deploymeta.isTriggered = false;
  deployRule.deploymeta.action = "No Deploy Action Needed";
  deployRule.deploymeta.status = "Outside This Deployment Tier";
};

// ======================================================
// Main Function
// ======================================================

module.exports.read_compute_Rebalancer = async (
  userId = null,
  rebalancerId = null,
) => {
  try {
    if (!userId || !rebalancerId) {
      throw new customError("Missing credentials", 400);
    }

    const PORTFOLIOREBALANCER_MODEL = mongoose.model("PortfolioRebalancer");

    const rebalancerDoc = await PORTFOLIOREBALANCER_MODEL.findOne({
      userId,
      _id: rebalancerId,
    });

    if (!rebalancerDoc) {
      throw new customError("Rebalancer not found", 404);
    }

    const All_financialAssets =
      await get_AllFinancialAssetWithCurrentValue(userId);

    const groupIdsSet = {};
    let totalCashReserve = 0;

    const respData = {
      groupId: rebalancerDoc.portfolioGroupId,
      rebalancerName: rebalancerDoc.rebalancerName,
      rebalancerDescription: rebalancerDoc.rebalancerDescription,

      summary: {
        sipAmount: rebalancerDoc.sipAmount || 0,
        investmentValue: 0,
        currentValue: 0,
        price: {
          price: 0,
          today: 0,
        },
      },

      groupLevelData: [],
      assetLevelData: [],
      marketFallRulesStats: [],
    };

    // ======================================================
    // Rebalancer Assets
    // ======================================================

    for (const asset of rebalancerDoc.assets) {
      const assetMetadataId = asset.assetId.toString();
      const groupId = asset.groupId.toString();

      groupIdsSet[groupId] = asset.groupName;

      const assetData = createAssetLevelData();

      assetData.meta.assetName = asset.assetName;
      assetData.meta.groupName = asset.groupName;
      assetData.meta.isCashReserve = asset?.isCashReserve || false;
      assetData.meta.groupId = asset.groupId;
      assetData.meta.targetWeight = toNumber(asset.targetWeight);
      assetData.meta.band = toNumber(asset.band);
      assetData.meta.multiplier = toNumber(asset.multiplier, 1);

      assetData.meta.relativeBand =
        assetData.meta.targetWeight > 0
          ? (assetData.meta.band / assetData.meta.targetWeight) * 100
          : 0;

      assetData.meta.upperLimit =
        assetData.meta.targetWeight + assetData.meta.band > 100
          ? 100
          : assetData.meta.targetWeight + assetData.meta.band;

      assetData.meta.lowerLimit =
        assetData.meta.targetWeight - assetData.meta.band < 0
          ? 0
          : assetData.meta.targetWeight - assetData.meta.band;

      const financialAsset = All_financialAssets?.[groupId];
      const position = financialAsset?.[assetMetadataId];

      if (financialAsset && position) {
        const investedValue = toNumber(position.investedValue);
        const currentValue = toNumber(position.currentValue);
        const pnl = calculatePnlPercentage(currentValue, investedValue);

        assetData.position.currentValue = currentValue;
        assetData.position.investedValue = investedValue;
        assetData.position.price.price = currentValue - investedValue;
        assetData.position.price.today = pnl;

        position.visited = true;

        assetData.meta.discountFactor = getDiscountFactor(pnl);

        if (assetData.meta.isCashReserve) {
          totalCashReserve += currentValue;
        }
      }

      respData.assetLevelData.push(assetData);
    }

    // ======================================================
    // Existing Holdings Not Included In Rebalancer Assets
    // ======================================================

    for (const [groupId, groupName] of Object.entries(groupIdsSet)) {
      const financialAsset = All_financialAssets?.[groupId];

      if (!financialAsset) continue;

      for (const [assetKey, assetValue] of Object.entries(financialAsset)) {
        if (assetValue.visited) continue;

        const assetMetadataIdKey = assetKey.toString();
        const assetData = createAssetLevelData();

        const { name } = get_SingleAssetMetaDataID(assetMetadataIdKey);

        assetData.meta.assetName = name;
        assetData.meta.groupName = groupName;
        assetData.meta.groupId = groupId;

        const investedValue = toNumber(assetValue.investedValue);
        const currentValue = toNumber(assetValue.currentValue);
        const pnl = calculatePnlPercentage(currentValue, investedValue);

        assetData.position.currentValue = currentValue;
        assetData.position.investedValue = investedValue;
        assetData.position.price.price = currentValue - investedValue;
        assetData.position.price.today = pnl;
        assetData.meta.discountFactor = getDiscountFactor(pnl);

        respData.assetLevelData.push(assetData);
      }
    }

    // ======================================================
    // Group Level Data
    // ======================================================

    let totalCurrentValue = 0;
    let totalInvestedValue = 0;

    for (const [groupId, groupName] of Object.entries(groupIdsSet)) {
      const groupData = createGroupLevelData();

      const consolidatedMetrics = {
        targetWeight: 0,
        currentValue: 0,
        investedValue: 0,
      };

      groupData.meta.groupName = groupName;
      groupData.meta.band = 4;

      for (const asset of respData.assetLevelData) {
        if (groupId === asset.meta.groupId.toString()) {
          consolidatedMetrics.targetWeight += toNumber(asset.meta.targetWeight);
          consolidatedMetrics.investedValue += toNumber(
            asset.position.investedValue,
          );
          consolidatedMetrics.currentValue += toNumber(asset.position.currentValue);
        }
      }

      groupData.meta.targetWeight = consolidatedMetrics.targetWeight;

      groupData.meta.upperLimit =
        groupData.meta.targetWeight + groupData.meta.band > 100
          ? 100
          : groupData.meta.targetWeight + groupData.meta.band;

      groupData.meta.lowerLimit =
        groupData.meta.targetWeight - groupData.meta.band < 0
          ? 0
          : groupData.meta.targetWeight - groupData.meta.band;

      const investedValue = consolidatedMetrics.investedValue;
      const currentValue = consolidatedMetrics.currentValue;
      const pnl = calculatePnlPercentage(currentValue, investedValue);

      groupData.position.currentValue = currentValue;
      groupData.position.investedValue = investedValue;
      groupData.position.price.price = currentValue - investedValue;
      groupData.position.price.today = pnl;

      respData.groupLevelData.push(groupData);

      totalCurrentValue += currentValue;
      totalInvestedValue += investedValue;
    }

    // ======================================================
    // Summary
    // ======================================================

    respData.summary.currentValue = totalCurrentValue;
    respData.summary.investmentValue = totalInvestedValue;
    respData.summary.price.price = totalCurrentValue - totalInvestedValue;
    respData.summary.price.today = calculatePnlPercentage(
      totalCurrentValue,
      totalInvestedValue,
    );

    // ======================================================
    // Asset Metrics
    // ======================================================

    for (const asset of respData.assetLevelData) {
      const currentWeight =
        respData.summary.currentValue > 0
          ? (asset.position.currentValue / respData.summary.currentValue) * 100
          : 0;

      asset.metrics.currentWeight = currentWeight;
      asset.metrics.driftPercentage = currentWeight - asset.meta.targetWeight;

      asset.metrics.driftAmount =
        respData.summary.currentValue *
        (asset.metrics.driftPercentage / 100);

      asset.metrics.status =
        currentWeight < asset.meta.lowerLimit
          ? "EXTREME UNDER WEIGHT"
          : currentWeight > asset.meta.upperLimit
            ? "EXTREME OVER WEIGHT"
            : "INSIDE";

      const sipScoreObj = {
        targetWeight: asset.meta.targetWeight,
        band: asset.meta.band,
        driftPercentage: asset.metrics.driftPercentage,
        multiplier: asset.meta.multiplier,
        discountFactor: asset.meta.discountFactor,
        status: asset.metrics.status,
      };

      asset.metrics.sipScore = calculateSipScore(sipScoreObj);

      const lumpsumScoreObj = {
        ...sipScoreObj,
        multiplier: asset.meta.multiplier * asset.meta.multiplier,
      };

      asset.metrics.lumpsumScore = calculateSipScore(lumpsumScoreObj);
    }

    let totalSipScore = 0;
    let totalLumpsumScore = 0;

    for (const asset of respData.assetLevelData) {
      totalSipScore += toNumber(asset.metrics.sipScore);
      totalLumpsumScore += toNumber(asset.metrics.lumpsumScore);
    }

    for (const asset of respData.assetLevelData) {
      asset.metrics.sipAmount =
        totalSipScore > 0
          ? (asset.metrics.sipScore / totalSipScore) *
            respData.summary.sipAmount
          : 0;

      asset.metrics.lumpsumAmount =
        totalLumpsumScore > 0
          ? (asset.metrics.lumpsumScore / totalLumpsumScore) *
            respData.summary.sipAmount
          : 0;
    }

    // ======================================================
    // Group Metrics
    // ======================================================

    for (const group of respData.groupLevelData) {
      const currentWeight =
        respData.summary.currentValue > 0
          ? (group.position.currentValue / respData.summary.currentValue) * 100
          : 0;

      group.metrics.currentWeight = currentWeight;
      group.metrics.driftPercentage = currentWeight - group.meta.targetWeight;

      group.metrics.driftAmount =
        respData.summary.currentValue *
        (group.metrics.driftPercentage / 100);

      group.metrics.status =
        currentWeight < group.meta.lowerLimit
          ? "EXTREME UNDER WEIGHT"
          : currentWeight > group.meta.upperLimit
            ? "EXTREME OVER WEIGHT"
            : "INSIDE";
    }

    // ======================================================
    // Market Fall Deployment Rule Setup
    // ======================================================

    const deployAssetBenchmarkIds = new Set();

    for (const deployRule of rebalancerDoc.marketFallRules || []) {
      const deployRuleData = createDeployementFallData();

      deployRuleData.deploymeta.fallPercentage = toNumber(
        deployRule.fallPercentage,
      );

      deployRuleData.deploymeta.deployPercentage = toNumber(
        deployRule.deployPercentage,
      );

      deployRuleData.deploymeta.deployAmount =
        (totalCashReserve * deployRuleData.deploymeta.deployPercentage) / 100;

      deployRuleData.deploymeta.shotNumber = toNumber(deployRule.shotNumber);
      deployRuleData.deploymeta.lastDeployed = deployRule.lastDeployed || null;
      deployRuleData.deploymeta.isTriggered = Boolean(deployRule.isTriggered);
      deployRuleData.deploymeta.isLocked = Boolean(deployRule.isLocked);

      const benchmarkMeta = get_SingleAssetMetaDataName(
        deployRuleData.benchmark.benchmarkname,
      );

      if (!benchmarkMeta?._id) {
        throw new customError("Invalid Benchmark", 400);
      }

      deployRuleData.benchmark.benchmarkId = benchmarkMeta._id.toString();

      deployAssetBenchmarkIds.add(deployRuleData.benchmark.benchmarkId);

      for (const asset of deployRule.assets || []) {
        const assetData = createFallDeploymentAssetData();

        assetData.assetId = asset.assetId.toString();
        assetData.assetName = asset.assetName;
        assetData.multiplier = toNumber(asset.multiplier, 1);
        assetData.min = toNumber(asset.min, 0.15);

        deployRuleData.assets.push(assetData);

        deployAssetBenchmarkIds.add(assetData.assetId);
      }

      respData.marketFallRulesStats.push(deployRuleData);
    }

    // Deployment tiers must be in ascending fall order: 10, 17, 23, 33, 40
    respData.marketFallRulesStats.sort(
      (a, b) => a.deploymeta.fallPercentage - b.deploymeta.fallPercentage,
    );

    const deployAssetBenchmarkIdsArray = [...deployAssetBenchmarkIds];

    const priceStats = await getAssetPriceStatsByIds(deployAssetBenchmarkIdsArray);

    // ======================================================
    // Market Fall Deployment Computation
    // ======================================================

    for (
      let currentIndex = 0;
      currentIndex < respData.marketFallRulesStats.length;
      currentIndex++
    ) {
      const deployRule = respData.marketFallRulesStats[currentIndex];

      const benchmarkPrice =
        priceStats?.[deployRule.benchmark.benchmarkId.toString()];

      if (
        !benchmarkPrice ||
        benchmarkPrice.maxPrice == null ||
        benchmarkPrice.currentPrice == null
      ) {
        throw new customError("Benchmark price not Available", 404);
      }

      deployRule.benchmark.maxPrice = benchmarkPrice.maxPrice;
      deployRule.benchmark.currentPrice = benchmarkPrice.currentPrice;
      deployRule.benchmark.fallPercentage = toNumber(
        benchmarkPrice.fallPercentage,
      );

      updateDeploymentMetaStatus({
        deployRule,
        currentIndex,
        allRules: respData.marketFallRulesStats,
        benchmarkFall: deployRule.benchmark.fallPercentage,
      });

      let totalTierScore = 0;

      for (const asset of deployRule.assets) {
        const assetPrice = priceStats?.[asset.assetId.toString()];

        if (
          !assetPrice ||
          assetPrice.maxPrice == null ||
          assetPrice.currentPrice == null
        ) {
          throw new customError("Asset price not Available", 404);
        }

        asset.maxPrice = assetPrice.maxPrice;
        asset.currentPrice = assetPrice.currentPrice;
        asset.fallPercentage = toNumber(assetPrice.fallPercentage);

        const groupId = getGroupIdByAssetId(rebalancerDoc.assets, asset.assetId);

        const score = calculateMarketFallScore({
          assetName: asset.assetName,
          multiplier: asset.multiplier,
          minScoreFactor: asset.min,
          assetFallPercentage: asset.fallPercentage,
          benchmarkFallPercentage: deployRule.benchmark.fallPercentage,
          groupId,
          assets: respData.assetLevelData,
        });

        asset.score = score;
        totalTierScore += score;
      }

      deployRule.totalTeirscore = roundNumber(totalTierScore, 2);

      for (const asset of deployRule.assets) {
        asset.deployAmount =
          totalTierScore > 0
            ? roundNumber(
                (asset.score / totalTierScore) *
                  deployRule.deploymeta.deployAmount,
                2,
              )
            : 0;
      }
    }

    return respData;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }

    throw new customError(error.message || "Internal Server Error", 500);
  }
};