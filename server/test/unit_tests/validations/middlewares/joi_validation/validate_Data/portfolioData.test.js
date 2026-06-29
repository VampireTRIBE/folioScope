// test/unit_tests/validations/middlewares/joi_validation/validate_Data/portfolioData.test.js

const {
  validate_GroupStatementData,
  validate_tradeData,
  validate_CreatePortfolioRebalancerData,
  validate_UpdatePortfolioRebalancerData,
} = require("../../../../../../utils/validations/middlewares/joi_validation/validate_Data/portfolioData");

const objectId = "507f1f77bcf86cd799439011";
const groupId = "507f1f77bcf86cd799439012";

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const expectValidationPasses = (middleware, body) => {
  const req = { body };
  const res = createResponse();
  const next = jest.fn();

  middleware(req, res, next);

  expect(next).toHaveBeenCalledTimes(1);
  expect(res.status).not.toHaveBeenCalled();
  return req.body;
};

const expectValidationFails = (middleware, body) => {
  const req = { body };
  const res = createResponse();
  const next = jest.fn();

  middleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(next).not.toHaveBeenCalled();
  expect(res.json).toHaveBeenCalledWith(
    expect.objectContaining({
      success: false,
    }),
  );
  return res.json.mock.calls[0][0];
};

describe("portfolioData Joi middleware", () => {
  test("validates group statement payload and converts amount", () => {
    const body = expectValidationPasses(validate_GroupStatementData, {
      type: "deposit",
      date: "2026-06-29T10:00:00.000Z",
      amount: "1500",
      extra: "removed",
    });

    expect(body).toEqual({
      type: "deposit",
      date: "2026-06-29T10:00:00.000Z",
      amount: 1500,
    });
  });

  test("rejects invalid group statement transaction type", () => {
    const error = expectValidationFails(validate_GroupStatementData, {
      type: "bonus",
      date: "2026-06-29T10:00:00.000Z",
      amount: 100,
    });

    expect(error.message).toContain(
      "Transaction must be 'deposit' or 'withdrawal' or 'tax'",
    );
  });

  test("validates buy trade payload and strips unknown keys", () => {
    const body = expectValidationPasses(validate_tradeData, {
      type: "buy",
      date: "2026-06-29T10:00:00.000Z",
      qty: "2",
      price: "100.50",
      ignored: true,
    });

    expect(body).toEqual({
      type: "buy",
      date: "2026-06-29T10:00:00.000Z",
      qty: 2,
      price: 100.5,
    });
  });

  test("rejects dividend trade payload when buy/sell fields are present", () => {
    const error = expectValidationFails(validate_tradeData, {
      type: "dividend",
      date: "2026-06-29T10:00:00.000Z",
      qty: 2,
      price: 100,
      dividendAmount: 50,
    });

    expect(error.message).toContain("qty is not allowed for dividend");
    expect(error.message).toContain("price is not allowed for dividend");
  });

  test("validates create portfolio rebalancer payload", () => {
    const body = expectValidationPasses(validate_CreatePortfolioRebalancerData, {
      portfolioGroupId: groupId,
      sipAmount: "5000",
      rebalancerName: " Core SIP ",
      rebalancerDescription: "Long term",
      assets: [
        {
          assetId: objectId,
          groupId,
          targetWeight: 80,
          band: 5,
          multiplier: 1.5,
        },
        {
          assetId: "507f1f77bcf86cd799439013",
          groupId,
          targetWeight: 20,
          band: 2,
          isCashReserve: true,
        },
      ],
      marketFallRules: [
        {
          fallPercentage: 10,
          deployPercentage: 25,
          assets: [{ assetId: objectId, multiplier: 2 }],
        },
      ],
      unknown: "removed",
    });

    expect(body.rebalancerName).toBe("Core SIP");
    expect(body.sipAmount).toBe(5000);
    expect(body.assets[0]).toEqual(
      expect.objectContaining({
        multiplier: 1.5,
        isCashReserve: false,
      }),
    );
    expect(body.marketFallRules[0].assets[0]).toEqual(
      expect.objectContaining({
        min: 0.15,
      }),
    );
    expect(body.unknown).toBeUndefined();
  });

  test("rejects create rebalancer payload with invalid total weight", () => {
    const error = expectValidationFails(validate_CreatePortfolioRebalancerData, {
      portfolioGroupId: groupId,
      sipAmount: 5000,
      rebalancerName: "Core SIP",
      assets: [
        {
          assetId: objectId,
          groupId,
          targetWeight: 90,
          band: 5,
          isCashReserve: true,
        },
      ],
    });

    expect(error.message).toContain(
      "Total asset target weight must be exactly 100",
    );
  });

  test("rejects market fall rules that target the cash reserve asset", () => {
    const cashAssetId = "507f1f77bcf86cd799439013";
    const error = expectValidationFails(validate_CreatePortfolioRebalancerData, {
      portfolioGroupId: groupId,
      sipAmount: 5000,
      rebalancerName: "Core SIP",
      assets: [
        {
          assetId: objectId,
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
        {
          fallPercentage: 10,
          deployPercentage: 25,
          assets: [{ assetId: cashAssetId }],
        },
      ],
    });

    expect(error.message).toContain(
      "Cash reserve assets cannot be selected in market fall rules",
    );
  });

  test("validates partial update rebalancer payload", () => {
    const body = expectValidationPasses(validate_UpdatePortfolioRebalancerData, {
      sipAmount: "2500",
      isActive: false,
    });

    expect(body).toEqual({
      sipAmount: 2500,
      isActive: false,
    });
  });

  test("rejects empty update rebalancer payload", () => {
    expectValidationFails(validate_UpdatePortfolioRebalancerData, {});
  });
});
