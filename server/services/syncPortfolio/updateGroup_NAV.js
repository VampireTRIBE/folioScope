const mongoose = require("mongoose");

module.exports.upsertNavPerformance = async ({
  session,
  portfolioGroupId,
  userId,
  date,
  type,
  amount,
}) => {
  const Nav = mongoose.model("navPerformence");
  const last = await Nav.findOne({
    portfolioGroupId,
    userId,
    date: { $lte: date },
  })
    .sort({ date: -1 })
    .session(session);
  if (!last) {
    if (type !== "deposit") {
      throw new Error("First transaction must be a deposit");
    }

    const nav = 100;
    const units = amount / nav;
    const value = amount;
    return await Nav.create(
      [
        {
          portfolioGroupId,
          userId,
          date,
          units,
          value,
          nav,
          messege: type,
        },
      ],
      { session },
    );
  }

  let units = last?.units || 0;
  let value = last?.value || 0;
  let nav = last?.nav || 100;
  // Avoid divide-by-zero
  if (units === 0 && type === "deposit") {
    units = 0;
    value = 0;
    nav = 100;
  }
  // 2. Apply logic
  if (type === "deposit") {
    const newUnits = amount / nav;
    units += newUnits;
    value += amount;
  } else if (type === "withdrawal") {
    const removedUnits = amount / nav;
    units -= removedUnits;
    value -= amount;
  } else if (type === "tax") {
    value -= amount;
  } else if (type === "market") {
    value += amount;
  }
  if (units > 0) {
    nav = value / units;
  } else {
    nav = 100;
  }
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
        messege: type,
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

module.exports.getGroupValues = async (userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  const groups = await PortfolioGroup.find(
    { userId },
    {
      _id: 1,
      userId: 1,
      consolidatedCurrentValue: 1,
    },
  )
    .session(session)
    .lean();

  return groups;
};
