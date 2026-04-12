const mongoose = require("mongoose");

module.exports.getNonLeafNodesWithRoot = async (userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");
  const parentIds = await PortfolioGroup.distinct("parentId", {
    userId,
  }).session(session);
  const nonLeafIds = parentIds.filter((id) => id !== null);
  return [...new Set([...nonLeafIds])];
};
