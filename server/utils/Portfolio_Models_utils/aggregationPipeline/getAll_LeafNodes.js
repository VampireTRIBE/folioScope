const mongoose = require("mongoose");

module.exports.getLeafNodes = async (userId) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  const parents = await PortfolioGroup.distinct("parentId", {
    userId,
    isDeleted: false,
    parentId: { $ne: null },
  });

  const leafs = await PortfolioGroup.find(
    {
      userId,
      isDeleted: false,
      _id: { $nin: parents },
    },
    { _id: 1 }, // projection
  );

  return leafs.map((doc) => doc._id);
};
