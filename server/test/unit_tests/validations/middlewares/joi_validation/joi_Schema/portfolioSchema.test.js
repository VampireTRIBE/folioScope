// test/unit_tests/validations/middlewares/joi_validation/joi_Schema/portfolioSchema.test.js

const {
  createPortfolioRebalancerValidationSchema,
  updatePortfolioRebalancerValidationSchema,
  trade_joi_Schema,
} = require("../../../../../../utils/validations/middlewares/joi_validation/joi_Schema/portfolioSchema");

const groupId = "507f1f77bcf86cd799439012";
const assetId = "507f1f77bcf86cd799439011";
const cashAssetId = "507f1f77bcf86cd799439013";

describe("portfolioSchema", () => {
  test("validates dividend trades without qty and price", () => {
    const { error, value } = trade_joi_Schema.validate({
      type: "dividend",
      date: "2026-06-29T10:00:00.000Z",
      dividendAmount: 125,
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      type: "dividend",
      date: "2026-06-29T10:00:00.000Z",
      dividendAmount: 125,
    });
  });

  test("rejects duplicate allocation assets in create rebalancer schema", () => {
    const { error } = createPortfolioRebalancerValidationSchema.validate({
      portfolioGroupId: groupId,
      sipAmount: 5000,
      rebalancerName: "Core SIP",
      assets: [
        {
          assetId,
          groupId,
          targetWeight: 50,
          band: 5,
        },
        {
          assetId,
          groupId,
          targetWeight: 50,
          band: 5,
          isCashReserve: true,
        },
      ],
    });

    expect(error.message).toContain("Duplicate assets are not allowed");
  });

  test("rejects duplicate market fall percentages", () => {
    const { error } = createPortfolioRebalancerValidationSchema.validate({
      portfolioGroupId: groupId,
      sipAmount: 5000,
      rebalancerName: "Core SIP",
      assets: [
        {
          assetId,
          groupId,
          targetWeight: 80,
          band: 5,
        },
        {
          assetId: cashAssetId,
          groupId,
          targetWeight: 20,
          band: 2,
          isCashReserve: true,
        },
      ],
      marketFallRules: [
        { fallPercentage: 10, deployPercentage: 25, assets: [{ assetId }] },
        { fallPercentage: 10, deployPercentage: 50, assets: [{ assetId }] },
      ],
    });

    expect(error.message).toContain(
      "Duplicate market fall percentages are not allowed",
    );
  });

  test("uses existing assets from Joi context for update market fall validation", () => {
    const { error, value } = updatePortfolioRebalancerValidationSchema.validate(
      {
        marketFallRules: [
          { fallPercentage: 20, deployPercentage: 50, assets: [{ assetId }] },
        ],
      },
      {
        context: {
          existingAssets: [
            {
              assetId,
              groupId,
              targetWeight: 80,
              band: 5,
            },
            {
              assetId: cashAssetId,
              groupId,
              targetWeight: 20,
              band: 2,
              isCashReserve: true,
            },
          ],
        },
      },
    );

    expect(error).toBeUndefined();
    expect(value.marketFallRules[0].assets[0]).toEqual(
      expect.objectContaining({
        assetId,
        multiplier: 1,
        min: 0.15,
      }),
    );
  });

  test("rejects update market fall asset that is not in existing assets", () => {
    const { error } = updatePortfolioRebalancerValidationSchema.validate(
      {
        marketFallRules: [
          { fallPercentage: 20, deployPercentage: 50, assets: [{ assetId }] },
        ],
      },
      {
        context: {
          existingAssets: [
            {
              assetId: cashAssetId,
              groupId,
              targetWeight: 100,
              band: 5,
              isCashReserve: true,
            },
          ],
        },
      },
    );

    expect(error.message).toContain(
      "Market fall rule contains asset ids that are not present in main assets",
    );
  });
});
