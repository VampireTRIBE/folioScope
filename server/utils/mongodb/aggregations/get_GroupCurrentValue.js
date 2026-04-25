const mongoose = require("mongoose");
module.exports.get_GroupCurrentValue = async (
  groupId,
  userId,
  session = null,
) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");
  const result = await PortfolioGroup.findOne({
    _id: groupId,
    userId,
  })
    .select("consolidatedCurrentValue")
    .session(session)
    .lean();
  return result ? result.consolidatedCurrentValue : null;
};
