// test/unit_tests/models/navSystem.test.js

const mongoose = require("mongoose");
const NavSystem = require("../../../models/Portfolio_Models/PortfolioMetrics_Models/navSystem");

describe("navSystem model", () => {
  test("validates required identifiers/date and applies NAV defaults", () => {
    const doc = new NavSystem({
      portfolioGroupId: new mongoose.Types.ObjectId(),
      userId: new mongoose.Types.ObjectId(),
      date: new Date("2026-06-29T10:00:00.000Z"),
    });

    const error = doc.validateSync();

    expect(error).toBeUndefined();
    expect(doc.units).toBe(0);
    expect(doc.nav).toBe(100);
    expect(doc.value).toBe(0);
  });

  test("requires portfolioGroupId, userId, and date", () => {
    const doc = new NavSystem({});
    const error = doc.validateSync();

    expect(error.errors).toEqual(
      expect.objectContaining({
        portfolioGroupId: expect.any(Object),
        userId: expect.any(Object),
        date: expect.any(Object),
      }),
    );
  });

  test("defines unique group-user-date and query indexes", () => {
    expect(NavSystem.schema.indexes()).toEqual(
      expect.arrayContaining([
        [
          { portfolioGroupId: 1, userId: 1, date: 1 },
          expect.objectContaining({ unique: true }),
        ],
        [{ portfolioGroupId: 1 }, expect.any(Object)],
        [{ date: 1 }, expect.any(Object)],
      ]),
    );
  });
});
