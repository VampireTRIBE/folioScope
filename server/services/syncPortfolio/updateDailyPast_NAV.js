const mongoose = require("mongoose");
const {
  getPastCloses,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getMarketPrice");
const {
  updatefinancialSnapshotsBulk,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updateFinancialSnapshots");
const {
  getCurrentFinancialDate,
} = require("../../utils/shared_Utils/helpers/getCurrentFinacialyear");
const {
  getLeafNodes,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_LeafNodes");
const {
  updatePortfolioGroupTree,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updatePortfolioGroupSnapshot");
const {
  getPortfolioGroupCurrentValues,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getConsolidatedCurrentValue");
const { upsertNavPerformance } = require("./updateGroup_NAV");

module.exports.updatePastNAV = async (userId) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const NAV_Model = mongoose.model("navPerformence");

      const lastNAVdateDoc = await NAV_Model.findOne({ userId })
        .select("date")
        .sort({ date: -1 })
        .session(session);

      if (!lastNAVdateDoc) {
        throw new Error("No NAV data found");
      }

      const start = new Date(getCurrentFinancialDate());

      const pastCloses = await getPastCloses(
        lastNAVdateDoc.date,
        start,
        session,
      );

      const leafNodes = await getLeafNodes(userId, session);

      for (const { assets, date } of pastCloses) {
        await updatefinancialSnapshotsBulk(userId, session, assets);

        await updatePortfolioGroupTree(leafNodes, userId, session);

        const portfolioGroups = await getPortfolioGroupCurrentValues(
          userId,
          session,
        );

        const bulkOps = portfolioGroups.map(
          ({ portfolioGroupId, consolidatedCurrentValue }) =>
            upsertNavPerformance({
              session,
              portfolioGroupId,
              userId,
              date,
              type: "market",
              amount: Number(consolidatedCurrentValue),
              job: true,
            }),
        );
        await Promise.all(bulkOps);
      }
    });
    return { success: true };
  } catch (err) {
    throw err;
  } finally {
    session.endSession();
  }
};
