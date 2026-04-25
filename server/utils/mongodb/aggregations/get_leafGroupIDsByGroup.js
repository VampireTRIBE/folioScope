const mongoose = require("mongoose");
module.exports.get_leafGroupIDsByGroup = async (
  groupId,
  userId,
  session = null,
) => {
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
