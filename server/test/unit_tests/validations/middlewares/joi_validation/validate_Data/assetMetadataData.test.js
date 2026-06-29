// test/unit_tests/validations/middlewares/joi_validation/validate_Data/assetMetadataData.test.js

jest.mock(
  "../../../../../../utils/validations/contentValidator/ISIN_Validator",
  () => ({
    validate_ISIN: jest.fn(() => true),
  }),
);

const {
  validate_AssetMetadata,
} = require("../../../../../../utils/validations/middlewares/joi_validation/validate_Data/assetMetadataData");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const validPayload = {
  tickerCode: {
    nse: "NIFTYBEES",
  },
  name: "Nifty Bees",
  currency: "INR",
  assetClass: "64f000000000000000000001",
  assetCategory: "64f000000000000000000002",
  assetSubCategory: "64f000000000000000000003",
};

describe("assetMetadataData Joi middleware", () => {
  test("passes valid asset metadata payload", () => {
    const req = {
      body: validPayload,
    };
    const res = createResponse();
    const next = jest.fn();

    validate_AssetMetadata(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("rejects missing payload", () => {
    const req = {};
    const res = createResponse();
    const next = jest.fn();

    validate_AssetMetadata(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid PayLoad",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects payload without an identifier", () => {
    const req = {
      body: {
        name: "Nifty Bees",
        currency: "INR",
        assetClass: "64f000000000000000000001",
        assetCategory: "64f000000000000000000002",
        assetSubCategory: "64f000000000000000000003",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    validate_AssetMetadata(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
