const mongoose = require("mongoose");
const {
  getAllGroupIdsByUser,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/get_IDs");
const {
  normalizeToIST5PM,
  normalizeToISTEndOfDay,
  normalizeToIST330PM,
} = require("../../utils/shared_Utils/helpers/getCurrentFinacialyear");
const {
  get_NavMeta,
  get_GroupAssetQtyMap,
  get_GroupWithCurrentValueMap,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/get_DataFromDatabase");

const {
  get_AllChildrenMap,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_NonLeafNodes");
const {
  getPastClosePrices,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getMarketPrice");

module.exports.getSortedLeafToRoot = (parentChilds) => {
  const depthMap = {};
  const visiting = new Set();

  const getDepth = (node) => {
    if (depthMap[node] !== undefined) return depthMap[node];

    if (visiting.has(node)) {
      throw new Error("Cycle detected in group hierarchy");
    }

    visiting.add(node);

    const children = parentChilds[node] || [];

    if (children.length === 0) {
      depthMap[node] = 0;
    } else {
      let maxChildDepth = 0;

      for (const child of children) {
        maxChildDepth = Math.max(maxChildDepth, getDepth(child));
      }

      depthMap[node] = maxChildDepth + 1;
    }

    visiting.delete(node);
    return depthMap[node];
  };

  for (const node in parentChilds) {
    getDepth(node);
  }

  return Object.keys(parentChilds).sort((a, b) => depthMap[a] - depthMap[b]);
};

module.exports.Fill_PastNAV_Redesign = async (
  userId,
  session = null,
  startDate = null,
  endDate = null,
) => {
  if (!session) throw new Error("session required");
  try {
    const NAV_Model = mongoose.model("navPerformence");
    if (!endDate) {
      throw new Error("End date is missing");
    }
    if (!startDate) {
      throw new Error("End date is missing");
    }
    startDate = normalizeToIST5PM(startDate);
    const lastNAVdateDocMap = await get_NavMeta(userId, startDate, session);

    endDate = normalizeToISTEndOfDay(endDate);
    const lastDate = normalizeToIST5PM(new Date(endDate));

    if (!lastNAVdateDocMap.lastDate) {
      const allGroupIds = await getAllGroupIdsByUser({ userId, session });

      const bulkOps = allGroupIds.map((groupId) => ({
        insertOne: {
          document: {
            portfolioGroupId: groupId,
            userId,
            messege: "Default",
            date: new Date(lastDate),
          },
        },
      }));
      await NAV_Model.bulkWrite(bulkOps, { session });
      return "no Single nav Doc Found";
    }

    const newGroupIds = lastNAVdateDocMap?.nullDate;
    const oldGroupIds = lastNAVdateDocMap?.nonNullDate;
    const leafGroupIds = lastNAVdateDocMap?.leafGroup;

    const [pastCloses, leafGroupQtyMap, leafGroupCurrentValueMap] =
      await Promise.all([
        getPastClosePrices(new Date(startDate), endDate, session),
        get_GroupAssetQtyMap(userId, session),
        get_GroupWithCurrentValueMap(leafGroupIds, userId, session),
      ]);

    if (newGroupIds.length !== 0) {
      const bulkOps = newGroupIds.map((groupId) => ({
        updateOne: {
          filter: {
            portfolioGroupId: groupId,
            userId,
            date: new Date(lastDate),
          },
          update: {
            $set: {
              messege: "default",
              nav: 100,
              units: 0,
              value: 0,
            },
          },
          upsert: true,
        },
      }));
      await NAV_Model.bulkWrite(bulkOps, { session });
    }

    const parentChilds = await get_AllChildrenMap(userId);
    const leafToBotton = this.getSortedLeafToRoot(parentChilds);

    let lastNavData = {};
    let bulkOps = [];
    let currentState = { ...oldGroupIds };

    while (startDate < endDate) {
      const navDate = normalizeToIST5PM(new Date(startDate));
      const priceDate = normalizeToIST330PM(new Date(startDate));
      for (const key of leafToBotton) {
        if (!currentState[key]) {
          continue;
        }

        const children = parentChilds[key];

        let nav = 100;
        let units = 0;
        let totalValue = 0;
        let totalUnits = 0;

        if (children.length === 0) {
          // LEAF NODE
          units = currentState[key]?.units || 0;
          totalValue = leafGroupCurrentValueMap[key] || 0;
          let totalmarketValue = 0;
          const assetListObj = leafGroupQtyMap?.[key];
          if (assetListObj) {
            for (const [assetId, qty] of Object.entries(assetListObj)) {
              let cmp = pastCloses[priceDate.toISOString()][assetId];
              totalmarketValue += Number(qty * cmp);
            }
          }
          totalValue += totalmarketValue;
          nav = units !== 0 ? totalValue / units : 100;
        } else {
          // PARENT NODE
          for (const child of children) {
            if (!currentState[child]) {
              continue;
              // throw new Error(`Missing NAV for child ${child}`);
            }

            totalValue += currentState[child].nav * currentState[child].units;
            totalUnits += currentState[child].units;
          }

          if (totalUnits > 0) {
            nav = totalValue / totalUnits;
            units = totalUnits;
          } else {
            nav = 100;
            units = 0;
          }
        }

        const dateKey = navDate.toISOString();
        lastNavData[dateKey] = lastNavData[dateKey] || {};
        lastNavData[dateKey][key] = { nav, units };

        currentState[key] = { nav, units };

        bulkOps.push({
          updateOne: {
            filter: {
              portfolioGroupId: key,
              userId,
              date: navDate,
            },
            update: {
              $set: {
                messege: "market",
                nav,
                units,
                value: totalValue,
              },
            },
            upsert: true,
          },
        });

        if (bulkOps.length === 500) {
          await NAV_Model.bulkWrite(bulkOps, { session });
          bulkOps = [];
        }
      }
      startDate.setUTCDate(startDate.getUTCDate() + 1);
    }

    bulkOps.length > 0 ? await NAV_Model.bulkWrite(bulkOps, { session }) : "";
  } catch (err) {
    throw err;
  }
};
