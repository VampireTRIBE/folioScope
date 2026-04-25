const mongoose = require("mongoose");
const { fill_MissingNAVs } = require("./fill_MissingNavs");
const {
  get_AllUserIDs,
} = require("../../utils/mongodb/aggregations/get_AlluserIds");
const {
  update_AssetSnapshots,
} = require("../../utils/mongodb/aggregations/update_AssetSnapshots");
const {
  get_AllLeafNodes,
} = require("../../utils/mongodb/aggregations/get_LeafNodes");
const {
  update_AllGroupsSnapshots,
} = require("../../utils/mongodb/aggregations/update_AllGroupsSnapshot");

module.exports.sync_FillFutureNAVs = async (
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
      await fill_MissingNAVs(userID, session, startDate, endDate);
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

module.exports.sync_Portfolio = async (userID = null) => {
  try {
    let userIds = [userID];
    if (!userID) {
      userIds = await get_AllUserIDs(session);
      if (userIds.length === 0) {
        return { success: false };
      }
    }
    for (const userId of userIds) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();
        const [leafNodes, updateResult] = await Promise.all([
          get_AllLeafNodes(userId, session),
          update_AssetSnapshots(userId, session),
        ]);
        await update_AllGroupsSnapshots(leafNodes, userId, session);
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
