const mongoose = require("mongoose");

module.exports.get_AllChildrenMap = async (userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  const groups = await PortfolioGroup.find({ userId })
    .select("_id path")
    .session(session)
    .lean();

  const result = {};

  // initialize all keys
  for (const g of groups) {
    result[g._id.toString()] = [];
  }

  // build descendants using path
  for (const g of groups) {
    const childId = g._id.toString();

    for (const ancestor of g.path) {
      const parentId = ancestor.toString();
      if (result[parentId]) {
        result[parentId].push(childId);
      }
    }
  }

  return result;
};