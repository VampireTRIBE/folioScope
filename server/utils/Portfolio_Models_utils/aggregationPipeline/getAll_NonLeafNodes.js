const mongoose = require("mongoose");

module.exports.get_AllChildrenMap = async (userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");

  const groups = await PortfolioGroup.find({ userId })
    .select("_id parentId")
    .session(session)
    .lean();

  const result = {};

  // initialize all nodes
  for (const g of groups) {
    result[g._id.toString()] = [];
  }

  // assign only direct children
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

module.exports.findLeafGroupIds = async (groupId, userId, session = null) => {
  const PortfolioGroup = mongoose.model("portfolioGroup");
  if (!groupId || !userId) {
    throw new Error("groupId and userId are required");
  }
  const rootId = new mongoose.Types.ObjectId(groupId);
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const filter = {
    isDeleted: false,
    userId: userObjectId,
    path: rootId,
  };

  if (session !== null) {
    filter.session = session;
  }

  const nodes = await PortfolioGroup.find(filter, {
    _id: 1,
    parentId: 1,
  }).lean();

  if (!nodes.length) return [];

  const childCount = new Map();
  for (const node of nodes) {
    if (node.parentId) {
      const key = node.parentId.toString();
      childCount.set(key, (childCount.get(key) || 0) + 1);
    }
  }

  const leaves = [];
  for (const node of nodes) {
    const id = node._id.toString();
    if (!childCount.has(id)) {
      leaves.push(node._id);
    }
  }
  return leaves;
};
