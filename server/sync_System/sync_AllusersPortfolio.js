const {
  sync_FillFutureNAVs,
} = require("../sync_Scripts/sync_Portfolio/sync_Portfolio");
const {
  get_AllUserIDs,
} = require("../utils/mongodb/aggregations/get_AlluserIds");
const {
  get_LastNavDatesByUser,
} = require("../utils/mongodb/aggregations/get_LastNavDatesByUser");

const TIME_INTERVEL = 4 * 60 * 1000;
module.exports.sync_AllUsersPortfolio = async () => {
  const [userIds, userNavMap] = await Promise.all([
    get_AllUserIDs(),
    get_LastNavDatesByUser(),
  ]);
  for (const userId of userIds) {
    await sync_FillFutureNAVs(
      userId,
      userNavMap[userId].lastNavDate,
      new Date(),
    );
    await this.sync_AllUsersPortfolio(userId);
  }
  setTimeout(syncAllUsersPortfolio, TIME_INTERVEL);
};
