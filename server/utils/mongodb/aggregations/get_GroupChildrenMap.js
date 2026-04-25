const mongoose = require("mongoose");

module.exports.get_GroupChildrenMap = async (userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  const groups = await PortfolioGroup.find({ userId })
    .select("_id parentId")
    .session(session)
    .lean();

  const result = {};
  for (const g of groups) {
    result[g._id.toString()] = [];
  }

  for (const g of groups) {
    if (!g.parentId) continue;

    const parentId = g.parentId.toString();
    const childId = g._id.toString();

    if (result[parentId]) {
      result[parentId].push(childId);
    }
  }
  return result;
};
