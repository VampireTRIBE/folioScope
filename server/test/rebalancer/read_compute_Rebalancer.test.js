// test/rebalancer/read_compute_Rebalancer.test.js

jest.mock("../../utils/mongodb/aggregations/get_financialAssets", () => ({
  get_AllFinancialAssetWithCurrentValue: jest.fn(),
}));

jest.mock(
  "../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache",
  () => ({
    get_SingleAssetMetaDataID: jest.fn(),
    get_SingleAssetMetaDataName: jest.fn(),
  }),
);

jest.mock("../../utils/mongodb/aggregations/get_AssetsPrice", () => ({
  getAssetPriceStatsByIds: jest.fn(),
}));

jest.mock("mongoose", () => ({
  model: jest.fn(),

  Types: {
    ObjectId: jest.fn((value) => value),
  },
}));

const mongoose = require("mongoose");

const {
  USER_ID,
  REBALANCER_ID,
  GROUP_COMMODITIES,
  GROUP_EQUITY,
  GROUP_CASH,
  ASSET_GOLD,
  ASSET_NIFTY,
  ASSET_MIDCAP,
  ASSET_CASH,

  baseRebalancerDoc,

  mockAssetMetaById,
  mockAssetMetaByName,

  mockFinancialAssets_Normal,
  mockPriceStats_NoFall,
  expected_Normal,

  mockRebalancerDoc_Fall12,
  mockFinancialAssets_Fall12,
  mockPriceStats_Fall12,
  expected_Fall12,

  mockRebalancerDoc_LockedTier,
  mockFinancialAssets_LockedTier,
  mockPriceStats_LockedTier,
  expected_LockedTier,

  mockRebalancerDoc_WithExtraHolding,
  mockFinancialAssets_WithExtraHolding,
  mockPriceStats_WithExtraHolding,
  expected_WithExtraHolding,
    mockRebalancerDoc_EmptyPortfolio,
  mockFinancialAssets_EmptyPortfolio,
  mockPriceStats_EmptyPortfolio,
  expected_EmptyPortfolio,

  mockRebalancerDoc_ZeroSipAmount,
  mockFinancialAssets_ZeroSipAmount,
  mockPriceStats_ZeroSipAmount,
  expected_ZeroSipAmount,

  mockRebalancerDoc_NoCashReserve,
  mockFinancialAssets_NoCashReserve,
  mockPriceStats_NoCashReserve,
  expected_NoCashReserve,

  mockRebalancerDoc_LockedSecondTierShot2,
  mockFinancialAssets_LockedSecondTierShot2,
  mockPriceStats_LockedSecondTierShot2,
  expected_LockedSecondTierShot2,

  mockRebalancerDoc_Shot3Completed,
  mockFinancialAssets_Shot3Completed,
  mockPriceStats_Shot3Completed,
  expected_Shot3Completed,

  mockPriceStats_MissingBenchmark,
  mockPriceStats_MissingDeploymentAsset,
} = require("./mock/rebalancer.mock");

const {
  read_compute_Rebalancer,
} = require("../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_compute_RebalancerById");

const {
  get_AllFinancialAssetWithCurrentValue,
} = require("../../utils/mongodb/aggregations/get_financialAssets");

const {
  get_SingleAssetMetaDataID,
  get_SingleAssetMetaDataName,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

const {
  getAssetPriceStatsByIds,
} = require("../../utils/mongodb/aggregations/get_AssetsPrice");

// ======================================================
// HELPERS
// ======================================================


const findGroup = (result, groupName) => {
  return result.groupLevelData.find((group) => {
    return group.meta.groupName === groupName;
  });
};

const findAsset = (result, assetName) => {
  return result.assetLevelData.find((asset) => {
    return asset.meta.assetName === assetName;
  });
};

const findRule = (result, fallPercentage) => {
  return result.marketFallRulesStats.find((rule) => {
    return rule.deploymeta.fallPercentage === fallPercentage;
  });
};

const findDeploymentAsset = (rule, assetName) => {
  return rule.assets.find((asset) => {
    return asset.assetName === assetName;
  });
};

const mockRebalancerFindOne = (doc) => {
  const findOneMock = jest.fn().mockResolvedValue(doc);

  mongoose.model.mockReturnValue({
    findOne: findOneMock,
  });

  return findOneMock;
};

const setupCommonMocks = ({ rebalancerDoc, financialAssets, priceStats }) => {
  mockRebalancerFindOne(rebalancerDoc);

  get_AllFinancialAssetWithCurrentValue.mockResolvedValue(financialAssets);

  getAssetPriceStatsByIds.mockResolvedValue(priceStats);

  get_SingleAssetMetaDataID.mockImplementation((assetId) => {
    return mockAssetMetaById[assetId.toString()];
  });

  get_SingleAssetMetaDataName.mockImplementation((assetName) => {
    return mockAssetMetaByName[assetName];
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

// ======================================================
// TEST 1: NORMAL SIP ALLOCATION
// ======================================================

test("calculates normal SIP allocation correctly", async () => {
  setupCommonMocks({
    rebalancerDoc: baseRebalancerDoc,
    financialAssets: mockFinancialAssets_Normal,
    priceStats: mockPriceStats_NoFall,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  expect(result.summary.currentValue).toBe(
    expected_Normal.summary.currentValue,
  );

  expect(result.summary.investmentValue).toBe(
    expected_Normal.summary.investmentValue,
  );

  expect(result.summary.price.price).toBe(expected_Normal.summary.profitLoss);

  expect(result.summary.price.today).toBeCloseTo(
    expected_Normal.summary.pnlPercentageApprox,
    2,
  );

  const gold = findAsset(result, "GOLDIETF");
  const nifty = findAsset(result, "SETFNIF50");
  const midcap = findAsset(result, "MIDCAPETF");
  const cash = findAsset(result, "LIQUIDCASH");

  expect(gold.metrics.currentWeight).toBeCloseTo(
    expected_Normal.assetWeightsApprox.GOLDIETF,
    2,
  );

  expect(nifty.metrics.currentWeight).toBeCloseTo(
    expected_Normal.assetWeightsApprox.SETFNIF50,
    2,
  );

  expect(midcap.metrics.currentWeight).toBeCloseTo(
    expected_Normal.assetWeightsApprox.MIDCAPETF,
    2,
  );

  expect(cash.metrics.currentWeight).toBeCloseTo(
    expected_Normal.assetWeightsApprox.LIQUIDCASH,
    2,
  );

  expect(gold.metrics.status).toBe(expected_Normal.assetStatus.GOLDIETF);
  expect(nifty.metrics.status).toBe(expected_Normal.assetStatus.SETFNIF50);
  expect(midcap.metrics.status).toBe(expected_Normal.assetStatus.MIDCAPETF);
  expect(cash.metrics.status).toBe(expected_Normal.assetStatus.LIQUIDCASH);

  expect(gold.metrics.sipScore).toBeCloseTo(
    expected_Normal.sipScoresApprox.GOLDIETF,
    2,
  );

  expect(nifty.metrics.sipScore).toBeCloseTo(
    expected_Normal.sipScoresApprox.SETFNIF50,
    2,
  );

  expect(midcap.metrics.sipScore).toBeCloseTo(
    expected_Normal.sipScoresApprox.MIDCAPETF,
    2,
  );

  expect(cash.metrics.sipScore).toBe(0);

  expect(gold.metrics.sipAmount).toBeCloseTo(
    expected_Normal.sipAmountsApprox.GOLDIETF,
    1,
  );

  expect(nifty.metrics.sipAmount).toBeCloseTo(
    expected_Normal.sipAmountsApprox.SETFNIF50,
    1,
  );

  expect(midcap.metrics.sipAmount).toBeCloseTo(
    expected_Normal.sipAmountsApprox.MIDCAPETF,
    1,
  );

  expect(cash.metrics.sipAmount).toBe(0);

  const firstRule = findRule(result, 10);

  expect(firstRule.deploymeta.isTriggered).toBe(false);
  expect(firstRule.deploymeta.status).toBe("Normal SIP");
  expect(firstRule.deploymeta.action).toBe("No Deploy Action Needed");
});

// ======================================================
// TEST 2: MARKET FALL DEPLOYMENT TRIGGER
// ======================================================

test("triggers first market fall deployment rule correctly", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_Fall12,
    financialAssets: mockFinancialAssets_Fall12,
    priceStats: mockPriceStats_Fall12,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  const firstRule = findRule(result, 10);
  const secondRule = findRule(result, 20);

  expect(firstRule.deploymeta.fallPercentage).toBe(
    expected_Fall12.firstRule.fallPercentage,
  );

  expect(firstRule.deploymeta.deployPercentage).toBe(
    expected_Fall12.firstRule.deployPercentage,
  );

  expect(firstRule.deploymeta.deployAmount).toBeCloseTo(
    expected_Fall12.firstRule.deployAmount,
    2,
  );

  expect(firstRule.benchmark.fallPercentage).toBe(
    expected_Fall12.firstRule.benchmarkFallPercentage,
  );

  expect(firstRule.deploymeta.isTriggered).toBe(true);
  expect(firstRule.deploymeta.action).toBe("Deploy Action Needed");
  expect(firstRule.deploymeta.status).toBe("Not Deployed Yet");

  expect(firstRule.totalTeirscore).toBeCloseTo(
    expected_Fall12.firstRule.totalTierScoreApprox,
    1,
  );

  const gold = findDeploymentAsset(firstRule, "GOLDIETF");
  const nifty = findDeploymentAsset(firstRule, "SETFNIF50");
  const midcap = findDeploymentAsset(firstRule, "MIDCAPETF");

  expect(gold.score).toBeCloseTo(
    expected_Fall12.firstRule.assetScoresApprox.GOLDIETF,
    1,
  );

  expect(nifty.score).toBeCloseTo(
    expected_Fall12.firstRule.assetScoresApprox.SETFNIF50,
    1,
  );

  expect(midcap.score).toBeCloseTo(
    expected_Fall12.firstRule.assetScoresApprox.MIDCAPETF,
    1,
  );

  expect(gold.deployAmount).toBeCloseTo(
    expected_Fall12.firstRule.assetDeployAmountsApprox.GOLDIETF,
    1,
  );

  expect(nifty.deployAmount).toBeCloseTo(
    expected_Fall12.firstRule.assetDeployAmountsApprox.SETFNIF50,
    1,
  );

  expect(midcap.deployAmount).toBeCloseTo(
    expected_Fall12.firstRule.assetDeployAmountsApprox.MIDCAPETF,
    1,
  );

  expect(secondRule.deploymeta.isTriggered).toBe(
    expected_Fall12.secondRule.isTriggered,
  );

  expect(secondRule.deploymeta.status).toBe(expected_Fall12.secondRule.status);
});

// ======================================================
// TEST 3: LOCKED DEPLOYMENT TIER
// ======================================================

test("does not trigger deployment when tier is locked", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_LockedTier,
    financialAssets: mockFinancialAssets_LockedTier,
    priceStats: mockPriceStats_LockedTier,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  const firstRule = findRule(result, 10);

  expect(firstRule.deploymeta.isLocked).toBe(
    expected_LockedTier.firstRule.isLocked,
  );

  expect(firstRule.deploymeta.shotNumber).toBe(
    expected_LockedTier.firstRule.shotNumber,
  );

  expect(firstRule.deploymeta.isTriggered).toBe(
    expected_LockedTier.firstRule.isTriggered,
  );

  expect(firstRule.deploymeta.action).toBe(
    expected_LockedTier.firstRule.action,
  );

  expect(firstRule.deploymeta.status).toBe(
    expected_LockedTier.firstRule.status,
  );
});

// ======================================================
// TEST 4: EXTRA HOLDING NOT INSIDE REBALANCER
// ======================================================

test("includes existing holding not configured in rebalancer assets", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_WithExtraHolding,
    financialAssets: mockFinancialAssets_WithExtraHolding,
    priceStats: mockPriceStats_WithExtraHolding,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  expect(result.summary.currentValue).toBe(
    expected_WithExtraHolding.summary.currentValue,
  );

  expect(result.summary.investmentValue).toBe(
    expected_WithExtraHolding.summary.investmentValue,
  );

  expect(result.summary.price.price).toBe(
    expected_WithExtraHolding.summary.profitLoss,
  );

  expect(result.summary.price.today).toBeCloseTo(
    expected_WithExtraHolding.summary.pnlPercentageApprox,
    2,
  );

  const gold = findAsset(result, "GOLDIETF");
  const nifty = findAsset(result, "SETFNIF50");
  const midcap = findAsset(result, "MIDCAPETF");
  const cash = findAsset(result, "LIQUIDCASH");
  const bank = findAsset(result, "BANKBEES");

  expect(bank).toBeDefined();

  expect(gold.metrics.currentWeight).toBeCloseTo(
    expected_WithExtraHolding.assetWeightsApprox.GOLDIETF,
    1,
  );

  expect(nifty.metrics.currentWeight).toBeCloseTo(
    expected_WithExtraHolding.assetWeightsApprox.SETFNIF50,
    1,
  );

  expect(midcap.metrics.currentWeight).toBeCloseTo(
    expected_WithExtraHolding.assetWeightsApprox.MIDCAPETF,
    1,
  );

  expect(cash.metrics.currentWeight).toBeCloseTo(
    expected_WithExtraHolding.assetWeightsApprox.LIQUIDCASH,
    1,
  );

  expect(bank.metrics.currentWeight).toBeCloseTo(
    expected_WithExtraHolding.assetWeightsApprox.BANKBEES,
    1,
  );

  expect(bank.meta.assetName).toBe(
    expected_WithExtraHolding.extraAsset.assetName,
  );
  expect(bank.meta.targetWeight).toBe(0);
  expect(bank.meta.band).toBe(0);
  expect(bank.metrics.status).toBe("EXTREME OVER WEIGHT");
  expect(bank.metrics.sipScore).toBe(0);
  expect(bank.metrics.lumpsumScore).toBe(0);
  expect(bank.metrics.sipAmount).toBe(0);
  expect(bank.metrics.lumpsumAmount).toBe(0);

  expect(gold.metrics.sipAmount).toBeCloseTo(
    expected_WithExtraHolding.sipAmountsApprox.GOLDIETF,
    1,
  );

  expect(nifty.metrics.sipAmount).toBeCloseTo(
    expected_WithExtraHolding.sipAmountsApprox.SETFNIF50,
    1,
  );

  expect(midcap.metrics.sipAmount).toBeCloseTo(
    expected_WithExtraHolding.sipAmountsApprox.MIDCAPETF,
    1,
  );
});


// ======================================================
// TEST 5: GROUP LEVEL DATA ACCURACY
// ======================================================

test("calculates group level data correctly", async () => {
  setupCommonMocks({
    rebalancerDoc: baseRebalancerDoc,
    financialAssets: mockFinancialAssets_Normal,
    priceStats: mockPriceStats_NoFall,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  const commodities = findGroup(result, "Commodities");
  const equity = findGroup(result, "Equity");
  const cash = findGroup(result, "Cash Reserve");

  expect(commodities).toBeDefined();
  expect(equity).toBeDefined();
  expect(cash).toBeDefined();

  expect(commodities.meta.targetWeight).toBe(20);
  expect(commodities.meta.band).toBe(4);
  expect(commodities.meta.upperLimit).toBe(24);
  expect(commodities.meta.lowerLimit).toBe(16);
  expect(commodities.position.currentValue).toBe(150000);
  expect(commodities.position.investedValue).toBe(160000);
  expect(commodities.position.price.price).toBe(-10000);
  expect(commodities.position.price.today).toBeCloseTo(-6.25, 2);
  expect(commodities.metrics.currentWeight).toBeCloseTo(15, 2);
  expect(commodities.metrics.driftPercentage).toBeCloseTo(-5, 2);
  expect(commodities.metrics.driftAmount).toBeCloseTo(-50000, 2);
  expect(commodities.metrics.status).toBe("EXTREME UNDER WEIGHT");

  expect(equity.meta.targetWeight).toBe(65);
  expect(equity.meta.band).toBe(4);
  expect(equity.meta.upperLimit).toBe(69);
  expect(equity.meta.lowerLimit).toBe(61);
  expect(equity.position.currentValue).toBe(525000);
  expect(equity.position.investedValue).toBe(530000);
  expect(equity.position.price.price).toBe(-5000);
  expect(equity.position.price.today).toBeCloseTo(-0.94, 2);
  expect(equity.metrics.currentWeight).toBeCloseTo(52.5, 2);
  expect(equity.metrics.driftPercentage).toBeCloseTo(-12.5, 2);
  expect(equity.metrics.driftAmount).toBeCloseTo(-125000, 2);
  expect(equity.metrics.status).toBe("EXTREME UNDER WEIGHT");

  expect(cash.meta.targetWeight).toBe(15);
  expect(cash.meta.band).toBe(4);
  expect(cash.meta.upperLimit).toBe(19);
  expect(cash.meta.lowerLimit).toBe(11);
  expect(cash.position.currentValue).toBe(325000);
  expect(cash.position.investedValue).toBe(325000);
  expect(cash.position.price.price).toBe(0);
  expect(cash.position.price.today).toBe(0);
  expect(cash.metrics.currentWeight).toBeCloseTo(32.5, 2);
  expect(cash.metrics.driftPercentage).toBeCloseTo(17.5, 2);
  expect(cash.metrics.driftAmount).toBeCloseTo(175000, 2);
  expect(cash.metrics.status).toBe("EXTREME OVER WEIGHT");
});

// ======================================================
// TEST 6: DISCOUNT FACTOR DIRECTLY THROUGH OUTPUT
// ======================================================

test("applies discount factor only after 7 percent fall", async () => {
  setupCommonMocks({
    rebalancerDoc: baseRebalancerDoc,
    financialAssets: mockFinancialAssets_Normal,
    priceStats: mockPriceStats_NoFall,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  const gold = findAsset(result, "GOLDIETF");
  const nifty = findAsset(result, "SETFNIF50");
  const midcap = findAsset(result, "MIDCAPETF");
  const cash = findAsset(result, "LIQUIDCASH");

  expect(gold.position.price.today).toBeCloseTo(-6.25, 2);
  expect(gold.meta.discountFactor).toBe(1);

  expect(nifty.position.price.today).toBeCloseTo(6.06, 2);
  expect(nifty.meta.discountFactor).toBe(1);

  expect(midcap.position.price.today).toBeCloseTo(-12.5, 2);
  expect(midcap.meta.discountFactor).toBeCloseTo(1.0825, 4);

  expect(cash.position.price.today).toBe(0);
  expect(cash.meta.discountFactor).toBe(1);
});

// ======================================================
// TEST 7: MISSING BENCHMARK PRICE ERROR
// ======================================================

test("throws error when benchmark price is missing", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_Fall12,
    financialAssets: mockFinancialAssets_Fall12,
    priceStats: mockPriceStats_MissingBenchmark,
  });

  await expect(
    read_compute_Rebalancer(USER_ID, REBALANCER_ID),
  ).rejects.toThrow("Benchmark price not Available");
});

// ======================================================
// TEST 8: MISSING DEPLOYMENT ASSET PRICE ERROR
// ======================================================

test("throws error when deployment asset price is missing", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_Fall12,
    financialAssets: mockFinancialAssets_Fall12,
    priceStats: mockPriceStats_MissingDeploymentAsset,
  });

  await expect(
    read_compute_Rebalancer(USER_ID, REBALANCER_ID),
  ).rejects.toThrow("Asset price not Available");
});

// ======================================================
// TEST 9: EMPTY PORTFOLIO BEHAVIOR
// ======================================================

test("handles empty portfolio without crashing", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_EmptyPortfolio,
    financialAssets: mockFinancialAssets_EmptyPortfolio,
    priceStats: mockPriceStats_EmptyPortfolio,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  expect(result.summary.sipAmount).toBe(expected_EmptyPortfolio.summary.sipAmount);
  expect(result.summary.currentValue).toBe(
    expected_EmptyPortfolio.summary.currentValue,
  );
  expect(result.summary.investmentValue).toBe(
    expected_EmptyPortfolio.summary.investmentValue,
  );
  expect(result.summary.price.price).toBe(
    expected_EmptyPortfolio.summary.profitLoss,
  );
  expect(result.summary.price.today).toBe(
    expected_EmptyPortfolio.summary.pnlPercentage,
  );

  expect(result.assetLevelData).toHaveLength(
    expected_EmptyPortfolio.assetLevelDataLength,
  );
  expect(result.groupLevelData).toHaveLength(
    expected_EmptyPortfolio.groupLevelDataLength,
  );
  expect(result.marketFallRulesStats).toHaveLength(
    expected_EmptyPortfolio.marketFallRulesStatsLength,
  );
});

// ======================================================
// TEST 10: ZERO SIP AMOUNT BEHAVIOR
// ======================================================

test("calculates scores but keeps SIP amounts zero when sipAmount is zero", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_ZeroSipAmount,
    financialAssets: mockFinancialAssets_ZeroSipAmount,
    priceStats: mockPriceStats_ZeroSipAmount,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  expect(result.summary.sipAmount).toBe(expected_ZeroSipAmount.sipAmount);

  const gold = findAsset(result, "GOLDIETF");
  const nifty = findAsset(result, "SETFNIF50");
  const midcap = findAsset(result, "MIDCAPETF");
  const cash = findAsset(result, "LIQUIDCASH");

  expect(gold.metrics.sipScore).toBeCloseTo(
    expected_ZeroSipAmount.sipScoresApprox.GOLDIETF,
    2,
  );
  expect(nifty.metrics.sipScore).toBeCloseTo(
    expected_ZeroSipAmount.sipScoresApprox.SETFNIF50,
    2,
  );
  expect(midcap.metrics.sipScore).toBeCloseTo(
    expected_ZeroSipAmount.sipScoresApprox.MIDCAPETF,
    2,
  );
  expect(cash.metrics.sipScore).toBe(
    expected_ZeroSipAmount.sipScoresApprox.LIQUIDCASH,
  );

  expect(gold.metrics.sipAmount).toBe(0);
  expect(nifty.metrics.sipAmount).toBe(0);
  expect(midcap.metrics.sipAmount).toBe(0);
  expect(cash.metrics.sipAmount).toBe(0);
});

// ======================================================
// TEST 11: CASH RESERVE MISSING BEHAVIOR
// ======================================================

test("does not deploy money when cash reserve asset is missing", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_NoCashReserve,
    financialAssets: mockFinancialAssets_NoCashReserve,
    priceStats: mockPriceStats_NoCashReserve,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  const firstRule = findRule(result, 10);

  expect(firstRule.deploymeta.fallPercentage).toBe(
    expected_NoCashReserve.firstRule.fallPercentage,
  );

  expect(firstRule.deploymeta.deployAmount).toBe(
    expected_NoCashReserve.firstRule.deployAmount,
  );

  expect(firstRule.deploymeta.isTriggered).toBe(
    expected_NoCashReserve.firstRule.isTriggered,
  );

  expect(firstRule.deploymeta.action).toBe(
    expected_NoCashReserve.firstRule.action,
  );

  expect(firstRule.deploymeta.status).toBe(
    expected_NoCashReserve.firstRule.status,
  );

  const gold = findDeploymentAsset(firstRule, "GOLDIETF");
  const nifty = findDeploymentAsset(firstRule, "SETFNIF50");
  const midcap = findDeploymentAsset(firstRule, "MIDCAPETF");

  expect(gold.deployAmount).toBe(
    expected_NoCashReserve.firstRule.assetDeployAmounts.GOLDIETF,
  );

  expect(nifty.deployAmount).toBe(
    expected_NoCashReserve.firstRule.assetDeployAmounts.SETFNIF50,
  );

  expect(midcap.deployAmount).toBe(
    expected_NoCashReserve.firstRule.assetDeployAmounts.MIDCAPETF,
  );
});

// ======================================================
// TEST 12: LOCKED SECOND TIER WITH SHOT NUMBER 2
// ======================================================

test("handles locked second deployment tier with shot number 2 correctly", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_LockedSecondTierShot2,
    financialAssets: mockFinancialAssets_LockedSecondTierShot2,
    priceStats: mockPriceStats_LockedSecondTierShot2,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  const secondRule = findRule(result, 20);

  expect(secondRule.deploymeta.fallPercentage).toBe(
    expected_LockedSecondTierShot2.secondRule.fallPercentage,
  );

  expect(secondRule.deploymeta.isLocked).toBe(
    expected_LockedSecondTierShot2.secondRule.isLocked,
  );

  expect(secondRule.deploymeta.shotNumber).toBe(
    expected_LockedSecondTierShot2.secondRule.shotNumber,
  );

  expect(secondRule.deploymeta.isTriggered).toBe(
    expected_LockedSecondTierShot2.secondRule.isTriggered,
  );

  expect(secondRule.deploymeta.action).toBe(
    expected_LockedSecondTierShot2.secondRule.action,
  );

  expect(secondRule.deploymeta.status).toBe(
    expected_LockedSecondTierShot2.secondRule.status,
  );
});

// ======================================================
// TEST 13: SHOT NUMBER 3 COMPLETED
// ======================================================

test("marks deployment tier completed when shot number is 3", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_Shot3Completed,
    financialAssets: mockFinancialAssets_Shot3Completed,
    priceStats: mockPriceStats_Shot3Completed,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  const firstRule = findRule(result, 10);

  expect(firstRule.deploymeta.fallPercentage).toBe(
    expected_Shot3Completed.firstRule.fallPercentage,
  );

  expect(firstRule.deploymeta.shotNumber).toBe(
    expected_Shot3Completed.firstRule.shotNumber,
  );

  expect(firstRule.deploymeta.isLocked).toBe(
    expected_Shot3Completed.firstRule.isLocked,
  );

  expect(firstRule.deploymeta.isTriggered).toBe(
    expected_Shot3Completed.firstRule.isTriggered,
  );

  expect(firstRule.deploymeta.action).toBe(
    expected_Shot3Completed.firstRule.action,
  );

  expect(firstRule.deploymeta.status).toBe(
    expected_Shot3Completed.firstRule.status,
  );
});

test("returns zero amounts instead of NaN when all SIP and lumpsum scores are zero", async () => {
  const zeroScoreRebalancerDoc = {
    ...baseRebalancerDoc,
    marketFallRules: [],
  };
  const zeroScoreFinancialAssets = {
    [GROUP_COMMODITIES]: {
      [ASSET_GOLD]: {
        investedValue: 200000,
        currentValue: 200000,
      },
    },
    [GROUP_EQUITY]: {
      [ASSET_NIFTY]: {
        investedValue: 400000,
        currentValue: 400000,
      },
      [ASSET_MIDCAP]: {
        investedValue: 250000,
        currentValue: 250000,
      },
    },
    [GROUP_CASH]: {
      [ASSET_CASH]: {
        investedValue: 150000,
        currentValue: 150000,
      },
    },
  };

  setupCommonMocks({
    rebalancerDoc: zeroScoreRebalancerDoc,
    financialAssets: zeroScoreFinancialAssets,
    priceStats: {},
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);

  for (const asset of result.assetLevelData) {
    expect(asset.metrics.sipScore).toBe(0);
    expect(asset.metrics.lumpsumScore).toBe(0);
    expect(asset.metrics.sipAmount).toBe(0);
    expect(asset.metrics.lumpsumAmount).toBe(0);
    expect(Number.isNaN(asset.metrics.sipAmount)).toBe(false);
    expect(Number.isNaN(asset.metrics.lumpsumAmount)).toBe(false);
  }
});

test("excludes cash reserve from deployment assets and never deploys more than available amount", async () => {
  setupCommonMocks({
    rebalancerDoc: mockRebalancerDoc_Fall12,
    financialAssets: mockFinancialAssets_Fall12,
    priceStats: mockPriceStats_Fall12,
  });

  const result = await read_compute_Rebalancer(USER_ID, REBALANCER_ID);
  const firstRule = findRule(result, 10);
  const totalAssetDeployment = firstRule.assets.reduce((sum, asset) => {
    return sum + Number(asset.deployAmount || 0);
  }, 0);

  expect(
    firstRule.assets.some((asset) => asset.assetName === "LIQUIDCASH"),
  ).toBe(false);
  expect(totalAssetDeployment).toBeLessThanOrEqual(
    firstRule.deploymeta.deployAmount,
  );
  expect(totalAssetDeployment).toBeCloseTo(firstRule.deploymeta.deployAmount, 0);
});
