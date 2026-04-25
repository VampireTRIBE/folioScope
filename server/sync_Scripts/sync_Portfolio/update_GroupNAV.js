const mongoose = require("mongoose");
const {
  normalizeToIST5PM,
} = require("../../utils/transformData/normalizeDates");

module.exports.update_GroupNAV = async ({
  session = null,
  portfolioGroupId,
  userId,
  date,
  type,
  amount = 0,
  job = false,
}) => {
  date = normalizeToIST5PM(date);
  amount = Number(amount);

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error("Invalid amount");
  }

  const Nav = mongoose.model("navPerformence");

  const last = await Nav.findOne({
    portfolioGroupId,
    userId,
    date: { $lte: date },
  })
    .sort({ date: -1 })
    .session(session);

  // =========================
  // ! FIRST ENTRY
  // =========================
  if (!last) {
    if (type !== "deposit" && type !== "market" && !job) {
      throw new Error("First transaction must be a deposit");
    }

    let nav = 100;
    let units = 0;
    let value = 0;

    if (type === "deposit") {
      units = amount / nav;
      value = amount;
    } else if (type === "market") {
      units = 0;
      value = amount;
    }

    return await Nav.create(
      [
        {
          portfolioGroupId,
          userId,
          date,
          units,
          value,
          nav,
          message: type,
        },
      ],
      { session },
    );
  }

  // =========================
  // ! LOAD PREVIOUS STATE
  // =========================
  let units = Number(last.units || 0);
  let value = Number(last.value || 0);
  let nav = Number(last.nav || 100);

  if (nav <= 0) {
    nav = 100;
  }

  // =========================
  // ! APPLY EVENT
  // =========================
  if (type === "deposit") {
    const newUnits = amount / nav;
    units += newUnits;
    value += amount;
  } else if (type === "withdrawal") {
    const removedUnits = amount / nav;

    if (removedUnits > units + 0.0000001) {
      throw new Error("Insufficient units");
    }

    units -= removedUnits;
    value -= amount;
  } else if (type === "tax") {
    if (amount > value + 0.0000001) {
      throw new Error("Tax exceeds value");
    }

    value -= amount;
  } else if (type === "market") {
    value = amount;
  } else {
    throw new Error("Invalid transaction type");
  }

  // =========================
  // ! CLEAN FLOAT NOISE
  // =========================
  if (Math.abs(units) < 0.0000001) units = 0;
  if (Math.abs(value) < 0.0000001) value = 0;

  if (units < 0) {
    throw new Error("Negative units detected");
  }

  if (value < 0) {
    value = 0;
  }

  // =========================
  // ! RECALCULATE NAV
  // =========================
  if (units > 0) {
    nav = value / units;
  } else {
    units = 0;
    nav = 100;
    value = 0;
  }

  // =========================
  // ! UPSERT SAME DAY ROW
  // =========================
  const result = await Nav.findOneAndUpdate(
    {
      portfolioGroupId,
      userId,
      date,
    },
    {
      $set: {
        units,
        value,
        nav,
        message: type,
      },
    },
    {
      upsert: true,
      new: true,
      session,
    },
  );

  return result;
};
