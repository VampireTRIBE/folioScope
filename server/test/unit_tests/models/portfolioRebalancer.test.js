// test/unit_tests/models/portfolioRebalancer.test.js

const mongoose = require("mongoose");
const PortfolioRebalancer = require("../../../models/Portfolio_Models/PortfolioMetrics_Models/portfolioRebalancer");

const objectId = () => new mongoose.Types.ObjectId();

const buildValidDoc = (overrides = {}) =>
  new PortfolioRebalancer({
    portfolioGroupId: objectId(),
    userId: objectId(),
    sipAmount: 5000,
    rebalancerName: "Core SIP",
    rebalancerDescription: "Long-term allocation",
    assets: [
      {
        assetId: objectId(),
        assetName: "Equity Fund",
        groupId: objectId(),
        groupName: "Equity",
        targetWeight: 80,
        band: 5,
        multiplier: 1.5,
      },
      {
        assetId: objectId(),
        assetName: "Cash",
        groupId: objectId(),
        groupName: "Cash Reserve",
        targetWeight: 20,
        band: 2,
        isCashReserve: true,
      },
    ],
    marketFallRules: [
      {
        fallPercentage: 10,
        deployPercentage: 25,
        assets: [{ assetId: objectId(), multiplier: 2 }],
      },
    ],
    ...overrides,
  });

describe("PortfolioRebalancer model", () => {
  test("validates a complete portfolio rebalancer document and applies defaults", async () => {
    const doc = buildValidDoc();

    await expect(doc.validate()).resolves.toBeUndefined();

    expect(doc.isActive).toBe(true);
    expect(doc.assets[0].isCashReserve).toBe(false);
    expect(doc.marketFallRules[0].isTriggered).toBe(false);
    expect(doc.marketFallRules[0].isLocked).toBe(false);
    expect(doc.marketFallRules[0].shotNumber).toBe(0);
    expect(doc.marketFallRules[0].lastDeployed).toBeNull();
    expect(doc.marketFallRules[0].assets[0].min).toBe(0.15);
  });

  test("rejects asset weights that do not total 100", async () => {
    const doc = buildValidDoc({
      assets: [
        {
          assetId: objectId(),
          groupId: objectId(),
          targetWeight: 90,
          band: 5,
          isCashReserve: true,
        },
      ],
    });

    await expect(doc.validate()).rejects.toThrow(
      "Total asset target weight must be exactly 100. Current total is 90",
    );
  });

  test("rejects allocations without exactly one cash reserve asset", async () => {
    const doc = buildValidDoc({
      assets: [
        {
          assetId: objectId(),
          groupId: objectId(),
          targetWeight: 50,
          band: 5,
        },
        {
          assetId: objectId(),
          groupId: objectId(),
          targetWeight: 50,
          band: 5,
        },
      ],
    });

    await expect(doc.validate()).rejects.toThrow(
      "Exactly one allocation asset must be cash reserve",
    );
  });

  test("rejects nested market fall values outside configured bounds", async () => {
    const doc = buildValidDoc({
      marketFallRules: [
        {
          fallPercentage: 101,
          deployPercentage: -1,
          assets: [{ assetId: objectId(), min: 0.1 }],
        },
      ],
    });

    await expect(doc.validate()).rejects.toMatchObject({
      errors: expect.objectContaining({
        "marketFallRules.0.fallPercentage": expect.any(Object),
        "marketFallRules.0.deployPercentage": expect.any(Object),
        "marketFallRules.0.assets.0.min": expect.any(Object),
      }),
    });
  });

  test("defines unique user and portfolio group index", () => {
    expect(PortfolioRebalancer.schema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { userId: 1, portfolioGroupId: 1 },
          expect.objectContaining({ unique: true }),
        ],
      ]),
    );
  });
});
