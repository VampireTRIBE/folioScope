const mongoose = require("mongoose");

module.exports.get_AllLeafNodes = async (userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");
  const parents = await PortfolioGroup.distinct("parentId", {
    userId,
    isDeleted: false,
    parentId: { $ne: null },
  }).session(session);
  const leafs = await PortfolioGroup.find(
    {
      userId,
      isDeleted: false,
      _id: { $nin: parents },
    },
    { _id: 1 },
  )
    .session(session)
    .lean();
  return leafs.map((doc) => doc._id.toString());
};
