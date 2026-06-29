// test/unit_tests/validations/contentValidator/ISIN_Validator.test.js

const {
  validate_ISIN,
} = require("../../../../utils/validations/contentValidator/ISIN_Validator");

describe("validate_ISIN", () => {
  test("accepts a valid ISIN with a correct check digit", () => {
    expect(validate_ISIN("US0378331005")).toBe(true);
    expect(validate_ISIN("INE002A01018")).toBe(true);
  });

  test("rejects an ISIN with an invalid check digit", () => {
    expect(validate_ISIN("US0378331006")).toBe(false);
  });

  test("rejects malformed or non-string values", () => {
    expect(validate_ISIN("us0378331005")).toBe(false);
    expect(validate_ISIN("US037833100")).toBe(false);
    expect(validate_ISIN(null)).toBe(false);
    expect(validate_ISIN(123)).toBe(false);
  });
});
