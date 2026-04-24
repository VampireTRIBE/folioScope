const mongoose = require("mongoose");
const {
  getAllUserIds,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_userIds");
const {
  updatefinancialCurrentSnapshots,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updateFinancialSnapshots");
const {
  getLeafNodes,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_LeafNodes");
const {
  updatePortfolioGroupTree,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updatePortfolioGroupSnapshot");
const { Fill_PastNAV_Redesign } = require("./fill_nav_GapV2");

module.exports.syncNavFutureGap = async (
  userID = null,
  startDate = null,
  endDate = null,
) => {
  try {
    if (!userID || !startDate) {
      return { success: false };
    }
    const session = await mongoose.startSession();
    try {
      session.startTransaction();
      endDate = endDate ? endDate : new Date();
      await Fill_PastNAV_Redesign(userID, session, startDate, endDate);
      await session.commitTransaction();
      session.endSession();
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      return { success: false };
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};

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
        await updatefinancialCurrentSnapshots(userId, session);
        const leafNodes = await getLeafNodes(userId, session);
        await updatePortfolioGroupTree(leafNodes, userId, session);
        await session.commitTransaction();
        session.endSession();
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.log(error);
        return { success: false };
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};
