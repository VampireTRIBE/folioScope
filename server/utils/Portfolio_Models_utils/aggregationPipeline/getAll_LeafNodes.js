const mongoose = require("mongoose");

module.exports.getLeafNodes = async (userId, session = null) => {
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

module.exports.getGroupToDescendantsMap = async (userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  const groups = await PortfolioGroup.find(
    { userId, isDeleted: false },
    { _id: 1, path: 1 },
  )
    .lean()
    .session(session);

  const map = {};

  for (const doc of groups) {
    const childId = doc._id.toString();

    for (const parentId of doc.path) {
      const pid = parentId.toString();

      if (!map[pid]) {
        map[pid] = [];
      }

      map[pid].push(childId);
    }
  }

  return map;
};
