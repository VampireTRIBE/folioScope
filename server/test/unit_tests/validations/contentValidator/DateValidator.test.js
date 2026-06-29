// test/unit_tests/validations/contentValidator/DateValidator.test.js

const {
  parseISODate,
} = require("../../../../utils/validations/contentValidator/DateValidator");

describe("parseISODate", () => {
  test("returns a Date for an exact ISO timestamp", async () => {
    const result = await parseISODate("2026-06-29T10:00:00.000Z");

    expect(result).toBeInstanceOf(Date);
    expect(result.toISOString()).toBe("2026-06-29T10:00:00.000Z");
  });

  test("rejects non-string values", async () => {
    await expect(parseISODate(new Date())).rejects.toThrow(
      "Date must be a string",
    );
  });

  test("rejects non-ISO date formats", async () => {
    await expect(parseISODate("2026-06-29")).rejects.toThrow(
      "Invalid ISO format",
    );
  });

  test("rejects impossible dates that JavaScript would otherwise normalize", async () => {
    await expect(parseISODate("2026-02-31T10:00:00.000Z")).rejects.toThrow(
      "Invalid or tampered date",
    );
  });
});
