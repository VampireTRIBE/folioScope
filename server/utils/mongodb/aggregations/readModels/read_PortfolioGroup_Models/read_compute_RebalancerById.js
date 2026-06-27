// ! Third Party Packages
const mongoose = require("mongoose");

// ! Utils
const customError = require("../../../../shared/error/customError");
const {
  get_AllFinancialAssetWithCurrentValue,
} = require("../../get_financialAssets");
const {
  get_SingleAssetMetaDataID,
} = require("../../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const { object } = require("joi");

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
  const numericBand = Number(pnlPercentage) || 0;
  return Math.min(
    1.35,
    numericBand < -0.07 ? 1 + (Math.abs(numericBand) - 0.07) * 1.5 : 1,
  );
};

const calculateSipScore = ({
  targetWeight = 0,
  band = 0,
  driftPercentage = 0,
  multiplier = 1,
  discountFactor = 1,
  status = "",
}) => {
  if (driftPercentage >= 0 || status === "EXTREME OVER WEIGHT") {
    return 0;
  }
  if (band === 0) {
    return 0;
  }

  return (
    targetWeight *
    (Math.abs(driftPercentage) / band) *
    multiplier *
    discountFactor
  );
};

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
    }).lean();

    if (!rebalancerDoc) {
      throw new customError("Rebalancer not found", 404);
    }

    let All_financialAssets =
      await get_AllFinancialAssetWithCurrentValue(userId);

    let groupIdsSet = {};

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
    };

    for (const asset of rebalancerDoc.assets) {
      const assetMetadataId = asset.assetId.toString();
      const groupId = asset.groupId.toString();
      groupIdsSet[groupId] = asset.groupName;
      let assetData = createAssetLevelData();

      // ! Data form Rebalancer
      assetData.meta.assetName = asset.assetName;
      assetData.meta.groupName = asset.groupName;
      assetData.meta.groupId = asset.groupId;
      assetData.meta.targetWeight = asset.targetWeight;
      assetData.meta.band = asset.band;
      assetData.meta.multiplier = asset.multiplier;
      assetData.meta.relativeBand =
        (Number(asset.band) / Number(asset.targetWeight)) * 100;
      assetData.meta.upperLimit =
        Number(asset.targetWeight) + Number(asset.band) > 100
          ? 100
          : Number(asset.targetWeight) + Number(asset.band);
      assetData.meta.lowerLimit =
        Number(asset.targetWeight) - Number(asset.band) < 0
          ? 0
          : Number(asset.targetWeight) - Number(asset.band);

      // ! Asset Position

      let finacialAsset = All_financialAssets?.[groupId];
      let position = finacialAsset?.[assetMetadataId];
      if (finacialAsset && position) {
        let investedValue = Number(position.investedValue);
        let currentValue = Number(position.currentValue);
        let pnl = ((currentValue - investedValue) / investedValue) * 100;
        assetData.position.currentValue = currentValue;
        assetData.position.investedValue = investedValue;
        assetData.position.price.price = currentValue - investedValue;
        assetData.position.price.today = pnl;
        position.visited = true;
        assetData.meta.discountFactor = getDiscountFactor(pnl);
      }
      respData.assetLevelData.push(assetData);
    }

    for (const [groupId, groupName] of Object.entries(groupIdsSet)) {
      let finacialAsset = All_financialAssets?.[groupId];
      if (finacialAsset) {
        for (const [assetKey, assetValue] of Object.entries(finacialAsset)) {
          if (!assetValue.visited) {
            let assetMetadataIdKey = assetKey.toString();
            let assetData = createAssetLevelData();
            const { name } = get_SingleAssetMetaDataID(assetMetadataIdKey);
            assetData.meta.assetName = name;
            assetData.meta.groupName = groupName;
            assetData.meta.groupId = groupId;

            // ! Asset Position
            let investedValue = Number(assetValue.investedValue);
            let currentValue = Number(assetValue.currentValue);
            let pnl = ((currentValue - investedValue) / investedValue) * 100;
            assetData.position.currentValue = currentValue;
            assetData.position.investedValue = investedValue;
            assetData.position.price.price = currentValue - investedValue;
            assetData.position.price.today = pnl;
            assetData.meta.discountFactor = getDiscountFactor(pnl);
            respData.assetLevelData.push(assetData);
          }
        }
      }
    }

    let totalCurrentValue = 0;
    let totalInvestedValue = 0;

    for (const [groupId, groupName] of Object.entries(groupIdsSet)) {
      let groupData = createGroupLevelData();

      let consolidatedMetrics = {
        targetWeight: 0,
        currentValue: 0,
        investedValue: 0,
      };

      // ! Meta
      groupData.meta.groupName = groupName;
      groupData.meta.band = 4;

      for (const asset of respData.assetLevelData) {
        if (groupId === asset.meta.groupId.toString()) {
          consolidatedMetrics.targetWeight += asset.meta.targetWeight;
          consolidatedMetrics.investedValue += asset.position.investedValue;
          consolidatedMetrics.currentValue += asset.position.currentValue;
        }
      }

      groupData.meta.targetWeight = consolidatedMetrics.targetWeight;
      groupData.meta.upperLimit =
        Number(groupData.meta.targetWeight) + Number(groupData.meta.band) > 100
          ? 100
          : Number(groupData.meta.targetWeight) + Number(groupData.meta.band);
      groupData.meta.lowerLimit =
        Number(groupData.meta.targetWeight) - Number(groupData.meta.band) < 0
          ? 0
          : Number(groupData.meta.targetWeight) - Number(groupData.meta.band);

      // ! Group Position
      let investedValue = Number(consolidatedMetrics.investedValue);
      let currentValue = Number(consolidatedMetrics.currentValue);
      let pnl = ((currentValue - investedValue) / investedValue) * 100;
      groupData.position.currentValue = currentValue;
      groupData.position.investedValue = investedValue;
      groupData.position.price.price = currentValue - investedValue;
      groupData.position.price.today = pnl || 0;
      respData.groupLevelData.push(groupData);
      totalCurrentValue += currentValue;
      totalInvestedValue += investedValue;
    }
    respData.summary.currentValue = totalCurrentValue;
    respData.summary.investmentValue = totalInvestedValue;
    respData.summary.price.price = totalCurrentValue - totalInvestedValue;
    respData.summary.price.today =
      (
        ((totalCurrentValue - totalInvestedValue) / totalInvestedValue) *
        100
      ).toFixed(2) || 0;

    for (let asset of respData.assetLevelData) {
      let currentWeight =
        (asset.position.currentValue / respData.summary.currentValue) * 100 ||
        0;
      asset.metrics.currentWeight = currentWeight;
      asset.metrics.driftPercentage = currentWeight - asset.meta.targetWeight;
      let driftAmount =
        respData.summary.currentValue * (asset.metrics.driftPercentage / 100);
      asset.metrics.driftAmount = driftAmount;

      asset.metrics.status =
        currentWeight < asset.meta.lowerLimit
          ? "EXTREME UNDER WEIGHT"
          : currentWeight > asset.meta.upperLimit
            ? "EXTREME OVER WEIGHT"
            : "INSIDE";

      const scoreObj = {
        targetWeight: asset.meta.targetWeight,
        band: asset.meta.band,
        driftPercentage: asset.metrics.driftPercentage,
        multiplier: asset.meta.multiplier,
        discountFactor: asset.meta.discountFactor,
        status: asset.metrics.status,
      };
      asset.metrics.sipScore = calculateSipScore(scoreObj);
      scoreObj.multiplier = asset.meta.multiplier * asset.meta.multiplier;
      asset.metrics.lumpsumScore = calculateSipScore(scoreObj);
    }

    let totalsipScore = 0;
    let totallumsumScore = 0;
    for (let asset of respData.assetLevelData) {
      totalsipScore += asset.metrics.sipScore;
      totallumsumScore += asset.metrics.lumpsumScore;
    }

    for (let asset of respData.assetLevelData) {
      asset.metrics.sipAmount =
        (asset.metrics.sipScore / totalsipScore) * respData.summary.sipAmount;
      asset.metrics.lumpsumAmount =
        (asset.metrics.lumpsumScore / totallumsumScore) *
        respData.summary.sipAmount;
    }

    for (let group of respData.groupLevelData) {
      let currentWeight =
        (group.position.currentValue / respData.summary.currentValue) * 100 ||
        0;
      group.metrics.currentWeight = currentWeight;
      group.metrics.driftPercentage = currentWeight - group.meta.targetWeight;
      let driftAmount =
        respData.summary.currentValue * (group.metrics.driftPercentage / 100);
      group.metrics.driftAmount = driftAmount;

      group.metrics.status =
        currentWeight < group.meta.lowerLimit
          ? "EXTREME UNDER WEIGHT"
          : currentWeight > group.meta.upperLimit
            ? "EXTREME OVER WEIGHT"
            : "INSIDE";
    }

    return respData;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }
    throw new customError(error.message || "Internal Server Error", 500);
  }
};
