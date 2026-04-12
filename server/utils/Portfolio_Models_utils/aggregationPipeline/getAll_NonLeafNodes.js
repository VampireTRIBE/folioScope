const mongoose = require("mongoose");

module.exports.getGroupChildrenMap = async (userId, session) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  const groups = await PortfolioGroup.find({ userId })
    .select("_id parentId level")
    .session(session)
    .lean();

  const childrenMap = {};
  for (const group of groups) {
    childrenMap[group._id.toString()] = {
      childrens: [],
      level: group.level,
    };
  }

  for (const group of groups) {
    if (group.parentId) {
      const parentKey = group.parentId.toString();
      childrenMap[parentKey].childrens.push(group._id.toString());
    }
  }
  return childrenMap;
};
