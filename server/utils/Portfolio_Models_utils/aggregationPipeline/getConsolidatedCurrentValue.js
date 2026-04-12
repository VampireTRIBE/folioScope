const mongoose = require("mongoose");

module.exports.getPortfolioGroupCurrentValues = async (
  userId,
  session = null,
) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");
  const groups = await PortfolioGroup.find(
    { userId: new mongoose.Types.ObjectId(userId) },
    { _id: 1, consolidatedCurrentValue: 1 },
  )
    .session(session)
    .lean();

  return groups.map((g) => ({
    portfolioGroupId: g._id.toString(),
    consolidatedCurrentValue: g.consolidatedCurrentValue || 0,
  }));
};
