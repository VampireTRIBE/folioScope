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
  try {
    let userIds = [userID];
    if (!userID) {
      userIds = await getAllUserIds(session);
      if (userIds.length === 0) {
        return { success: false };
      }
    }
    for (const userId of userIds) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        await updatefinancialSnapshotsBulk(userId, session);
        const leafNodes = await getLeafNodes(userId, session);
        await updatePortfolioGroupTree(leafNodes, userId, session);
        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        return { success: false };
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
