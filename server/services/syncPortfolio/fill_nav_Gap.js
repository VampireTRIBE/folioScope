const mongoose = require("mongoose");
const {
  getPastClosePrices,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getMarketPrice");
const {
  updatefinancial_SnapshotsBulk,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updateFinancialSnapshots");

const {
  updatePortfolioGroupTree,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updatePortfolioGroupSnapshot");
const {
  getPortfolioGroupCurrentValues,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getConsolidatedCurrentValue");
const { upsertNavPerformance } = require("./updateGroup_NAV");
const {
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_NonLeafNodes");
const {
  getGroupToDescendantsMap,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_LeafNodes");

module.exports.Fill_PastNAV = async (
  userId,
  session = null,
  endDate = null,
) => {
  session = await mongoose.startSession();
  if (!session) throw new Error("session required");
  try {
    const test = await session.withTransaction(async () => {
      const NAV_Model = mongoose.model("navPerformence");
      const PortfolioGroup_Model = mongoose.model("portfolioGroup");
      endDate = new Date(endDate);
      if (!endDate) {
        throw new Error("End date is missing");
      }

      const lastNAVdateDoc = await NAV_Model.findOne({ userId })
        .select("date")
        .sort({ date: -1 })
        .session(session);

      // if (!lastNAVdateDoc) {
      //   return;
      // }

      // const startDate = new Date(lastNAVdateDoc.date);
      const startDate = new Date("2026-04-01T10:00:00.000Z");

      const pastCloses = await getPastClosePrices(startDate, endDate, session);
      let index = 0;
      let date_assets_currentValue = [];
      while (startDate < endDate) {
        if (pastCloses[index]?.date !== startDate.toISOString()) {
          index--;
        }
        const { assets } = pastCloses[index];
        const assets_currentValue = await updatefinancial_SnapshotsBulk(
          userId,
          session,
          assets,
        );
        date_assets_currentValue.push({
          ...assets_currentValue,
          date: new Date(startDate),
        });
        startDate.setDate(startDate.getDate() + 1);
        index++;
      }
      const getGroupCurrentValue = await PortfolioGroup_Model.aggregate(
        [
          { $match: { userId } },
          {
            $project: {
              _id: 1,
              totalGain: {
                $add: [
                  "$groupSnapshot.lifetime.realizedGain",
                  "$groupSnapshot.lifetime.dividend",
                ],
              },
              consolidatedCash: 1,
            },
          },
        ],
        { session },
      );

      let getGroupCurrentValueMap = {};
      for (const { _id, consolidatedCash, totalGain } of getGroupCurrentValue) {
        getGroupCurrentValueMap[_id] = {
          totalcurentValue: consolidatedCash + totalGain,
        };
      }

      const bulkOps = date_assets_currentValue.map(({ group, date }) =>
        upsertNavPerformance({
          session,
          portfolioGroupId: group.groupId,
          userId,
          date,
          type: "market",
          amount: Number(
            getGroupCurrentValueMap[group.groupId].totalcurentValue +
              group.currentValue,
          ),
          job: true,
        }),
      );
      await Promise.all(bulkOps);
      
    });
    return test;
    return { success: true };
  } catch (err) {
    console.log(err);
    throw err;
  } finally {
    session.endSession();
  }
};
