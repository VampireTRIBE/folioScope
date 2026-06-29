// test/unit_tests/sync_Portfolio/update_GroupNAV.test.js

jest.mock("mongoose", () => ({
  model: jest.fn(),
}));

const mongoose = require("mongoose");

const {
  update_GroupNAV,
} = require("../../../sync_Scripts/sync_Portfolio/update_GroupNAV");

const createFindOneChain = (result) => {
  const chain = {
    sort: jest.fn(() => chain),
    session: jest.fn(() => Promise.resolve(result)),
  };
  return chain;
};

describe("update_GroupNAV", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates first deposit NAV row with base NAV 100", async () => {
    const Nav = {
      findOne: jest.fn(() => createFindOneChain(null)),
      create: jest.fn().mockResolvedValue([{ _id: "nav-id" }]),
    };
    mongoose.model.mockReturnValue(Nav);

    const result = await update_GroupNAV({
      session: "session",
      portfolioGroupId: "group-id",
      userId: "user-id",
      date: new Date("2026-06-29T00:00:00.000Z"),
      type: "deposit",
      amount: 10000,
    });

    expect(Nav.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          portfolioGroupId: "group-id",
          userId: "user-id",
          units: 100,
          value: 10000,
          nav: 100,
          message: "deposit",
        }),
      ],
      { session: "session" },
    );
    expect(result).toEqual([{ _id: "nav-id" }]);
  });

  test("rejects first withdrawal when no NAV row exists", async () => {
    const Nav = {
      findOne: jest.fn(() => createFindOneChain(null)),
    };
    mongoose.model.mockReturnValue(Nav);

    await expect(
      update_GroupNAV({
        session: "session",
        portfolioGroupId: "group-id",
        userId: "user-id",
        date: new Date("2026-06-29T00:00:00.000Z"),
        type: "withdrawal",
        amount: 1000,
      }),
    ).rejects.toThrow("First transaction must be a deposit");
  });

  test("updates existing NAV row for withdrawal and recalculates NAV", async () => {
    const Nav = {
      findOne: jest.fn(() =>
        createFindOneChain({
          units: 100,
          value: 12000,
          nav: 120,
        }),
      ),
      findOneAndUpdate: jest.fn().mockResolvedValue({ _id: "updated-nav-id" }),
    };
    mongoose.model.mockReturnValue(Nav);

    const result = await update_GroupNAV({
      session: "session",
      portfolioGroupId: "group-id",
      userId: "user-id",
      date: new Date("2026-06-29T00:00:00.000Z"),
      type: "withdrawal",
      amount: 1200,
    });

    expect(Nav.findOneAndUpdate).toHaveBeenCalledWith(
      {
        portfolioGroupId: "group-id",
        userId: "user-id",
        date: expect.any(Date),
      },
      {
        $set: {
          units: 90,
          value: 10800,
          nav: 120,
          message: "withdrawal",
        },
      },
      {
        upsert: true,
        new: true,
        session: "session",
      },
    );
    expect(result).toEqual({ _id: "updated-nav-id" });
  });

  test("deposit after market gain increases units without changing NAV return", async () => {
    const Nav = {
      findOne: jest.fn(() =>
        createFindOneChain({
          units: 100,
          value: 12000,
          nav: 120,
        }),
      ),
      findOneAndUpdate: jest.fn().mockResolvedValue({ _id: "deposit-nav-id" }),
    };
    mongoose.model.mockReturnValue(Nav);

    await update_GroupNAV({
      session: "session",
      portfolioGroupId: "group-id",
      userId: "user-id",
      date: new Date("2026-06-30T00:00:00.000Z"),
      type: "deposit",
      amount: 2400,
    });

    expect(Nav.findOneAndUpdate).toHaveBeenCalledWith(
      {
        portfolioGroupId: "group-id",
        userId: "user-id",
        date: expect.any(Date),
      },
      {
        $set: {
          units: 120,
          value: 14400,
          nav: 120,
          message: "deposit",
        },
      },
      {
        upsert: true,
        new: true,
        session: "session",
      },
    );
  });

  test("withdrawal after market gain reduces units without changing NAV return", async () => {
    const Nav = {
      findOne: jest.fn(() =>
        createFindOneChain({
          units: 100,
          value: 12000,
          nav: 120,
        }),
      ),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        _id: "withdrawal-nav-id",
      }),
    };
    mongoose.model.mockReturnValue(Nav);

    await update_GroupNAV({
      session: "session",
      portfolioGroupId: "group-id",
      userId: "user-id",
      date: new Date("2026-06-30T00:00:00.000Z"),
      type: "withdrawal",
      amount: 2400,
    });

    expect(Nav.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          units: 80,
          value: 9600,
          nav: 120,
          message: "withdrawal",
        },
      },
      expect.objectContaining({
        upsert: true,
        new: true,
        session: "session",
      }),
    );
  });

  test("market value change updates NAV while units stay constant", async () => {
    const Nav = {
      findOne: jest.fn(() =>
        createFindOneChain({
          units: 100,
          value: 10000,
          nav: 100,
        }),
      ),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        _id: "market-nav-id",
      }),
    };
    mongoose.model.mockReturnValue(Nav);

    await update_GroupNAV({
      session: "session",
      portfolioGroupId: "group-id",
      userId: "user-id",
      date: new Date("2026-06-30T00:00:00.000Z"),
      type: "market",
      amount: 12500,
    });

    expect(Nav.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          units: 100,
          value: 12500,
          nav: 125,
          message: "market",
        },
      },
      expect.objectContaining({
        upsert: true,
        new: true,
        session: "session",
      }),
    );
  });

  test("full withdrawal resets empty portfolio to base NAV state", async () => {
    const Nav = {
      findOne: jest.fn(() =>
        createFindOneChain({
          units: 100,
          value: 12000,
          nav: 120,
        }),
      ),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        _id: "empty-nav-id",
      }),
    };
    mongoose.model.mockReturnValue(Nav);

    await update_GroupNAV({
      session: "session",
      portfolioGroupId: "group-id",
      userId: "user-id",
      date: new Date("2026-06-30T00:00:00.000Z"),
      type: "withdrawal",
      amount: 12000,
    });

    expect(Nav.findOneAndUpdate).toHaveBeenCalledWith(
      expect.any(Object),
      {
        $set: {
          units: 0,
          value: 0,
          nav: 100,
          message: "withdrawal",
        },
      },
      expect.objectContaining({
        upsert: true,
        new: true,
        session: "session",
      }),
    );
  });

  test("rejects invalid amount", async () => {
    await expect(
      update_GroupNAV({
        portfolioGroupId: "group-id",
        userId: "user-id",
        date: new Date("2026-06-29T00:00:00.000Z"),
        type: "deposit",
        amount: -1,
      }),
    ).rejects.toThrow("Invalid amount");
  });
});
