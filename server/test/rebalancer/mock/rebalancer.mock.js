// test/rebalancer/mock/rebalancer.mock.js

// ======================================================
// MOCK IDS
// ======================================================

const USER_ID = "66f000000000000000000001";
const REBALANCER_ID = "66f000000000000000000010";

const GROUP_COMMODITIES = "65f000000000000000000001";
const GROUP_EQUITY = "65f000000000000000000002";
const GROUP_CASH = "65f000000000000000000003";

const ASSET_GOLD = "64f000000000000000000001";
const ASSET_NIFTY = "64f000000000000000000002";
const ASSET_MIDCAP = "64f000000000000000000003";
const ASSET_CASH = "64f000000000000000000004";
const ASSET_BANK = "64f000000000000000000005";

const BENCHMARK_NIFTY_50 = "64f000000000000000000099";

// ======================================================
// MOCK ASSET METADATA CACHE
// ======================================================

const mockAssetMetaById = {
  [ASSET_GOLD]: {
    _id: ASSET_GOLD,
    name: "GOLDIETF",
  },

  [ASSET_NIFTY]: {
    _id: ASSET_NIFTY,
    name: "SETFNIF50",
  },

  [ASSET_MIDCAP]: {
    _id: ASSET_MIDCAP,
    name: "MIDCAPETF",
  },

  [ASSET_CASH]: {
    _id: ASSET_CASH,
    name: "LIQUIDCASH",
  },

  [ASSET_BANK]: {
    _id: ASSET_BANK,
    name: "BANKBEES",
  },

  [BENCHMARK_NIFTY_50]: {
    _id: BENCHMARK_NIFTY_50,
    name: "NIFTY 50",
  },
};

const mockAssetMetaByName = {
  GOLDIETF: mockAssetMetaById[ASSET_GOLD],
  SETFNIF50: mockAssetMetaById[ASSET_NIFTY],
  MIDCAPETF: mockAssetMetaById[ASSET_MIDCAP],
  LIQUIDCASH: mockAssetMetaById[ASSET_CASH],
  BANKBEES: mockAssetMetaById[ASSET_BANK],
  "NIFTY 50": mockAssetMetaById[BENCHMARK_NIFTY_50],
};

// ======================================================
// BASE REBALANCER DOC
// ======================================================

const baseRebalancerDoc = {
  _id: REBALANCER_ID,
  userId: USER_ID,
  portfolioGroupId: "65f000000000000000000099",

  sipAmount: 10000,

  rebalancerName: "Main Rebalancer Test",
  rebalancerDescription: "Mock rebalancer for calculation testing",

  assets: [
    {
      assetId: ASSET_GOLD,
      assetName: "GOLDIETF",
      groupId: GROUP_COMMODITIES,
      groupName: "Commodities",
      targetWeight: 20,
      band: 3,
      multiplier: 1.2,
      isCashReserve: false,
    },

    {
      assetId: ASSET_NIFTY,
      assetName: "SETFNIF50",
      groupId: GROUP_EQUITY,
      groupName: "Equity",
      targetWeight: 40,
      band: 4,
      multiplier: 1,
      isCashReserve: false,
    },

    {
      assetId: ASSET_MIDCAP,
      assetName: "MIDCAPETF",
      groupId: GROUP_EQUITY,
      groupName: "Equity",
      targetWeight: 25,
      band: 5,
      multiplier: 1.1,
      isCashReserve: false,
    },

    {
      assetId: ASSET_CASH,
      assetName: "LIQUIDCASH",
      groupId: GROUP_CASH,
      groupName: "Cash Reserve",
      targetWeight: 15,
      band: 2,
      multiplier: 1,
      isCashReserve: true,
    },
  ],

  marketFallRules: [
    {
      fallPercentage: 10,
      deployPercentage: 20,
      isTriggered: false,
      isLocked: false,
      shotNumber: 0,
      lastDeployed: null,

      assets: [
        {
          assetId: ASSET_GOLD,
          assetName: "GOLDIETF",
          multiplier: 1.2,
          min: 0.15,
        },

        {
          assetId: ASSET_NIFTY,
          assetName: "SETFNIF50",
          multiplier: 1,
          min: 0.15,
        },

        {
          assetId: ASSET_MIDCAP,
          assetName: "MIDCAPETF",
          multiplier: 1.1,
          min: 0.15,
        },
      ],
    },

    {
      fallPercentage: 20,
      deployPercentage: 30,
      isTriggered: false,
      isLocked: false,
      shotNumber: 0,
      lastDeployed: null,

      assets: [
        {
          assetId: ASSET_GOLD,
          assetName: "GOLDIETF",
          multiplier: 1.2,
          min: 0.15,
        },

        {
          assetId: ASSET_NIFTY,
          assetName: "SETFNIF50",
          multiplier: 1,
          min: 0.15,
        },

        {
          assetId: ASSET_MIDCAP,
          assetName: "MIDCAPETF",
          multiplier: 1.1,
          min: 0.15,
        },
      ],
    },
  ],

  isActive: true,
};

// ======================================================
// CASE 1: NORMAL SIP, NO DEPLOYMENT
// ======================================================

const mockFinancialAssets_Normal = {
  [GROUP_COMMODITIES]: {
    [ASSET_GOLD]: {
      _id: "67f000000000000000000001",
      investedValue: 160000,
      currentValue: 150000,
    },
  },

  [GROUP_EQUITY]: {
    [ASSET_NIFTY]: {
      _id: "67f000000000000000000002",
      investedValue: 330000,
      currentValue: 350000,
    },

    [ASSET_MIDCAP]: {
      _id: "67f000000000000000000003",
      investedValue: 200000,
      currentValue: 175000,
    },
  },

  [GROUP_CASH]: {
    [ASSET_CASH]: {
      _id: "67f000000000000000000004",
      investedValue: 325000,
      currentValue: 325000,
    },
  },
};

const mockPriceStats_NoFall = {
  [BENCHMARK_NIFTY_50]: {
    maxPrice: 20000,
    currentPrice: 18800,
    fallPercentage: 6,
  },

  [ASSET_GOLD]: {
    maxPrice: 100,
    currentPrice: 92,
    fallPercentage: 8,
  },

  [ASSET_NIFTY]: {
    maxPrice: 200,
    currentPrice: 188,
    fallPercentage: 6,
  },

  [ASSET_MIDCAP]: {
    maxPrice: 100,
    currentPrice: 95,
    fallPercentage: 5,
  },
};

const expected_Normal = {
  summary: {
    currentValue: 1000000,
    investmentValue: 1015000,
    profitLoss: -15000,
    pnlPercentageApprox: -1.48,
  },

  assetWeightsApprox: {
    GOLDIETF: 15,
    SETFNIF50: 35,
    MIDCAPETF: 17.5,
    LIQUIDCASH: 32.5,
  },

  assetStatus: {
    GOLDIETF: "EXTREME UNDER WEIGHT",
    SETFNIF50: "EXTREME UNDER WEIGHT",
    MIDCAPETF: "EXTREME UNDER WEIGHT",
    LIQUIDCASH: "EXTREME OVER WEIGHT",
  },

  sipScoresApprox: {
    GOLDIETF: 40,
    SETFNIF50: 50,
    MIDCAPETF: 44.65,
    LIQUIDCASH: 0,
  },

  sipAmountsApprox: {
    GOLDIETF: 2970.6,
    SETFNIF50: 3713.24,
    MIDCAPETF: 3316.16,
    LIQUIDCASH: 0,
  },
};

// ======================================================
// CASE 2: MARKET FALL 12%
// ======================================================

const mockRebalancerDoc_Fall12 = JSON.parse(JSON.stringify(baseRebalancerDoc));

const mockFinancialAssets_Fall12 = mockFinancialAssets_Normal;

const mockPriceStats_Fall12 = {
  [BENCHMARK_NIFTY_50]: {
    maxPrice: 20000,
    currentPrice: 17600,
    fallPercentage: 12,
  },

  [ASSET_GOLD]: {
    maxPrice: 100,
    currentPrice: 85,
    fallPercentage: 15,
  },

  [ASSET_NIFTY]: {
    maxPrice: 200,
    currentPrice: 176,
    fallPercentage: 12,
  },

  [ASSET_MIDCAP]: {
    maxPrice: 100,
    currentPrice: 82,
    fallPercentage: 18,
  },
};

const expected_Fall12 = {
  firstRule: {
    fallPercentage: 10,
    deployPercentage: 20,
    deployAmount: 65000,

    benchmarkFallPercentage: 12,

    isTriggered: true,
    action: "Deploy Action Needed",
    status: "Not Deployed Yet",

    totalTierScoreApprox: 659.38,

    assetScoresApprox: {
      GOLDIETF: 150,
      SETFNIF50: 200,
      MIDCAPETF: 309.38,
    },

    assetDeployAmountsApprox: {
      GOLDIETF: 14786.62,
      SETFNIF50: 19715.49,
      MIDCAPETF: 30497.89,
    },
  },

  secondRule: {
    fallPercentage: 20,
    isTriggered: false,
    status: "Outside This Deployment Tier",
  },
};

// ======================================================
// CASE 3: LOCKED TIER
// ======================================================

const mockRebalancerDoc_LockedTier = JSON.parse(
  JSON.stringify(baseRebalancerDoc),
);

mockRebalancerDoc_LockedTier.marketFallRules[0].isLocked = true;
mockRebalancerDoc_LockedTier.marketFallRules[0].shotNumber = 1;
mockRebalancerDoc_LockedTier.marketFallRules[0].lastDeployed =
  "2026-06-20T10:00:00.000Z";

const mockFinancialAssets_LockedTier = mockFinancialAssets_Normal;
const mockPriceStats_LockedTier = mockPriceStats_Fall12;

const expected_LockedTier = {
  firstRule: {
    isTriggered: false,
    action: "No Deploy Action Needed",
    status: "Locked Until Benchmark Reaches ATH Again",
    shotNumber: 1,
    isLocked: true,
  },
};

// ======================================================
// CASE 4: EXTRA HOLDING NOT IN REBALANCER
// ======================================================

const mockRebalancerDoc_WithExtraHolding = JSON.parse(
  JSON.stringify(baseRebalancerDoc),
);

const mockFinancialAssets_WithExtraHolding = {
  [GROUP_COMMODITIES]: {
    [ASSET_GOLD]: {
      _id: "67f000000000000000000001",
      investedValue: 160000,
      currentValue: 150000,
    },
  },

  [GROUP_EQUITY]: {
    [ASSET_NIFTY]: {
      _id: "67f000000000000000000002",
      investedValue: 330000,
      currentValue: 350000,
    },

    [ASSET_MIDCAP]: {
      _id: "67f000000000000000000003",
      investedValue: 200000,
      currentValue: 175000,
    },

    [ASSET_BANK]: {
      _id: "67f000000000000000000005",
      investedValue: 90000,
      currentValue: 100000,
    },
  },

  [GROUP_CASH]: {
    [ASSET_CASH]: {
      _id: "67f000000000000000000004",
      investedValue: 325000,
      currentValue: 325000,
    },
  },
};

const mockPriceStats_WithExtraHolding = mockPriceStats_Fall12;

const expected_WithExtraHolding = {
  summary: {
    currentValue: 1100000,
    investmentValue: 1105000,
    profitLoss: -5000,
    pnlPercentageApprox: -0.45,
  },

  extraAsset: {
    assetName: "BANKBEES",
    targetWeight: 0,
    band: 0,
    currentWeightApprox: 9.09,
    status: "EXTREME OVER WEIGHT",
    sipScore: 0,
    lumpsumScore: 0,
    sipAmount: 0,
    lumpsumAmount: 0,
  },

  assetWeightsApprox: {
    GOLDIETF: 13.64,
    SETFNIF50: 31.82,
    MIDCAPETF: 15.91,
    LIQUIDCASH: 29.55,
    BANKBEES: 9.09,
  },

  sipAmountsApprox: {
    GOLDIETF: 2724.56,
    SETFNIF50: 4378.76,
    MIDCAPETF: 2896.67,
    LIQUIDCASH: 0,
    BANKBEES: 0,
  },
};

// ======================================================
// CASE 5: EMPTY PORTFOLIO
// ======================================================

const mockRebalancerDoc_EmptyPortfolio = {
  _id: REBALANCER_ID,
  userId: USER_ID,
  portfolioGroupId: "65f000000000000000000099",

  sipAmount: 10000,

  rebalancerName: "Empty Portfolio Rebalancer",
  rebalancerDescription: "No assets and no market fall rules",

  assets: [],
  marketFallRules: [],
  isActive: true,
};

const mockFinancialAssets_EmptyPortfolio = {};
const mockPriceStats_EmptyPortfolio = {};

const expected_EmptyPortfolio = {
  summary: {
    sipAmount: 10000,
    currentValue: 0,
    investmentValue: 0,
    profitLoss: 0,
    pnlPercentage: 0,
  },

  assetLevelDataLength: 0,
  groupLevelDataLength: 0,
  marketFallRulesStatsLength: 0,
};

// ======================================================
// CASE 6: ZERO SIP AMOUNT
// ======================================================

const mockRebalancerDoc_ZeroSipAmount = JSON.parse(
  JSON.stringify(baseRebalancerDoc),
);

mockRebalancerDoc_ZeroSipAmount.sipAmount = 0;

const mockFinancialAssets_ZeroSipAmount = mockFinancialAssets_Normal;
const mockPriceStats_ZeroSipAmount = mockPriceStats_NoFall;

const expected_ZeroSipAmount = {
  sipAmount: 0,

  sipAmounts: {
    GOLDIETF: 0,
    SETFNIF50: 0,
    MIDCAPETF: 0,
    LIQUIDCASH: 0,
  },

  // Scores should still calculate even when SIP amount is zero.
  sipScoresApprox: {
    GOLDIETF: 40,
    SETFNIF50: 50,
    MIDCAPETF: 44.65,
    LIQUIDCASH: 0,
  },
};

// ======================================================
// CASE 7: CASH RESERVE MISSING
// Function behavior: does not throw, but deployment amount becomes 0.
// Schema validation should prevent this during DB save.
// ======================================================

const mockRebalancerDoc_NoCashReserve = JSON.parse(
  JSON.stringify(baseRebalancerDoc),
);

mockRebalancerDoc_NoCashReserve.assets = mockRebalancerDoc_NoCashReserve.assets.map(
  (asset) => ({
    ...asset,
    isCashReserve: false,
  }),
);

const mockFinancialAssets_NoCashReserve = mockFinancialAssets_Normal;
const mockPriceStats_NoCashReserve = mockPriceStats_Fall12;

const expected_NoCashReserve = {
  totalCashReserve: 0,

  firstRule: {
    fallPercentage: 10,
    deployAmount: 0,
    isTriggered: true,
    action: "Deploy Action Needed",
    status: "Not Deployed Yet",

    assetDeployAmounts: {
      GOLDIETF: 0,
      SETFNIF50: 0,
      MIDCAPETF: 0,
    },
  },
};

// ======================================================
// CASE 8: LOCKED SECOND TIER WITH SHOT NUMBER 2
// Benchmark max = 20000
// Previous tier fall = 10%
// Unlock price = 20000 - 10% = 18000
// ======================================================

const mockRebalancerDoc_LockedSecondTierShot2 = JSON.parse(
  JSON.stringify(baseRebalancerDoc),
);

mockRebalancerDoc_LockedSecondTierShot2.marketFallRules[1].isLocked = true;
mockRebalancerDoc_LockedSecondTierShot2.marketFallRules[1].shotNumber = 2;
mockRebalancerDoc_LockedSecondTierShot2.marketFallRules[1].lastDeployed =
  "2026-06-20T10:00:00.000Z";

const mockFinancialAssets_LockedSecondTierShot2 = mockFinancialAssets_Normal;

const mockPriceStats_LockedSecondTierShot2 = {
  [BENCHMARK_NIFTY_50]: {
    maxPrice: 20000,
    currentPrice: 15000,
    fallPercentage: 25,
  },

  [ASSET_GOLD]: {
    maxPrice: 100,
    currentPrice: 75,
    fallPercentage: 25,
  },

  [ASSET_NIFTY]: {
    maxPrice: 200,
    currentPrice: 150,
    fallPercentage: 25,
  },

  [ASSET_MIDCAP]: {
    maxPrice: 100,
    currentPrice: 70,
    fallPercentage: 30,
  },
};

const expected_LockedSecondTierShot2 = {
  secondRule: {
    fallPercentage: 20,
    isLocked: true,
    shotNumber: 2,
    isTriggered: false,
    action: "No Deploy Action Needed",
    status: "Locked Until Benchmark Reaches Again At 18000",
  },
};

// ======================================================
// CASE 9: SHOT NUMBER 3 COMPLETED
// Function behavior: if shotNumber >= 3 and not locked,
// deployment is completed and no action is needed.
// ======================================================

const mockRebalancerDoc_Shot3Completed = JSON.parse(
  JSON.stringify(baseRebalancerDoc),
);

mockRebalancerDoc_Shot3Completed.marketFallRules[0].isLocked = false;
mockRebalancerDoc_Shot3Completed.marketFallRules[0].shotNumber = 3;

const mockFinancialAssets_Shot3Completed = mockFinancialAssets_Normal;
const mockPriceStats_Shot3Completed = mockPriceStats_Fall12;

const expected_Shot3Completed = {
  firstRule: {
    fallPercentage: 10,
    shotNumber: 3,
    isLocked: false,
    isTriggered: false,
    action: "No Deploy Action Needed",
    status: "All Deployment Shots Completed",
  },
};

// ======================================================
// CASE 10: MISSING BENCHMARK PRICE
// ======================================================

const mockPriceStats_MissingBenchmark = {};

// ======================================================
// CASE 11: MISSING DEPLOYMENT ASSET PRICE
// ======================================================

const mockPriceStats_MissingDeploymentAsset = {
  [BENCHMARK_NIFTY_50]: {
    maxPrice: 20000,
    currentPrice: 17600,
    fallPercentage: 12,
  },
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  USER_ID,
  REBALANCER_ID,

  GROUP_COMMODITIES,
  GROUP_EQUITY,
  GROUP_CASH,

  ASSET_GOLD,
  ASSET_NIFTY,
  ASSET_MIDCAP,
  ASSET_CASH,
  ASSET_BANK,

  BENCHMARK_NIFTY_50,

  mockAssetMetaById,
  mockAssetMetaByName,

  baseRebalancerDoc,

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
};