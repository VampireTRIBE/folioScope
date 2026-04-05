const mongoose = require("mongoose");
const {
  getAllUserIds,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_userIds");
const {
  updatefinancialSnapshotsBulk,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updateFinancialSnapshots");
const {
  getLeafNodes,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_LeafNodes");
const {
  updatePortfolioGroupTree,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updatePortfolioGroupSnapshot");

module.exports.syncPortfolio = async (userID = null) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    let userIds = [userID];
    if (!userID) {
      userIds = await getAllUserIds(session);
    }
    for (const userId of userIds) {
      await updatefinancialSnapshotsBulk(userId, session);
      const leafNodes = await getLeafNodes(userId, session);
      await updatePortfolioGroupTree(leafNodes, userId, session);
    }
    await session.commitTransaction();
    session.endSession();
    return { success: true };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { success: false };
  }
};
