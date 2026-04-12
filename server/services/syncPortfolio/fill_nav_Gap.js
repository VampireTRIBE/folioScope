const mongoose = require("mongoose");
const {
  getPastClosePrices,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getMarketPrice");
const {
  updatefinancial_SnapshotsBulk,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updateFinancialSnapshots");

const {
  rollupNavBottomToTop,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/updatePortfolioGroupSnapshot");
const { upsertNavPerformance } = require("./updateGroup_NAV");
const {
  getGroupChildrenMap,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_NonLeafNodes");
const {
  getLeafNodes,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_LeafNodes");
const {
  normalizeToIST5PM,
} = require("../../utils/shared_Utils/helpers/getCurrentFinacialyear");

module.exports.Fill_PastNAV = async (
  userId,
  session = null,
  endDate = null,
) => {
  if (!session) throw new Error("session required");
  try {
    await session.withTransaction(async () => {
      const NAV_Model = mongoose.model("navPerformence");
      const PortfolioGroup_Model = mongoose.model("portfolioGroup");
      endDate = new Date(endDate);
      const endDateCopy = new Date(endDate);
      if (!endDate) {
        throw new Error("End date is missing");
      }

      const lastNAVdateDoc = await NAV_Model.findOne({ userId })
        .select("date")
        .sort({ date: -1 })
        .session(session);

      if (!lastNAVdateDoc) {
        return;
      }

      const startDate = new Date(lastNAVdateDoc.date);
      const startDateCopy = new Date(startDate);

      const pastCloses = await getPastClosePrices(startDate, endDate, session);

      console.log(pastCloses);

      let index = 0;
      let date_assets_currentValue = [];
      while (startDate < endDate) {
        if (
          normalizeToIST5PM(pastCloses[index]?.date).toString() !==
          normalizeToIST5PM(startDate).toString()
        ) {
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

      let updatedGroupId = [];
      let dateArray = [];

      const bulkOps = date_assets_currentValue.map(({ group, date }) => {
        if (!updatedGroupId.includes(group.groupId)) {
          updatedGroupId.push(group.groupId);
        }

        if (!dateArray.includes(date)) {
          dateArray.push(date);
        }
        const baseValue =
          getGroupCurrentValueMap[group.groupId]?.totalcurentValue || 0;
        return upsertNavPerformance({
          session,
          portfolioGroupId: group.groupId,
          userId,
          date,
          type: "market",
          amount: Number(baseValue + group.currentValue),
          job: true,
        });
      });

      await Promise.all(bulkOps);

      const leafIds = await getLeafNodes(userId, session);

      for (const id of leafIds) {
        let bulkOps = [];
        for (const date of dateArray) {
          if (!updatedGroupId.includes(id)) {
            bulkOps.push(
              upsertNavPerformance({
                session,
                portfolioGroupId: id,
                userId,
                date,
                type: "market",
                amount: Number(getGroupCurrentValueMap[id].totalcurentValue),
                job: true,
              }),
            );
          }
        }
        await Promise.all(bulkOps);
      }

      const GroupChildrenMap = await getGroupChildrenMap(userId, session);

      const GroupLevel1 = Object.entries(GroupChildrenMap)
        .filter(([id, data]) => data.level === 1 && data.childrens.length > 0)
        .reduce((acc, [id, data]) => {
          acc[id] = data;
          return acc;
        }, {});

      const GroupLevel2 = Object.entries(GroupChildrenMap)
        .filter(([id, data]) => data.level === 2 && data.childrens.length > 0)
        .reduce((acc, [id, data]) => {
          acc[id] = data;
          return acc;
        }, {});

      const GroupLevel3 = Object.entries(GroupChildrenMap)
        .filter(([id, data]) => data.level === 3 && data.childrens.length > 0)
        .reduce((acc, [id, data]) => {
          acc[id] = data;
          return acc;
        }, {});

      while (startDateCopy < endDateCopy) {
        await rollupNavBottomToTop({
          userId,
          date: startDateCopy,
          session,
          group: GroupLevel3,
        });
        await rollupNavBottomToTop({
          userId,
          date: startDateCopy,
          session,
          group: GroupLevel2,
        });
        await rollupNavBottomToTop({
          userId,
          date: startDateCopy,
          session,
          group: GroupLevel1,
        });
        startDateCopy.setDate(startDateCopy.getDate() + 1);
      }
    });
  } catch (err) {
    throw err;
  }
};
