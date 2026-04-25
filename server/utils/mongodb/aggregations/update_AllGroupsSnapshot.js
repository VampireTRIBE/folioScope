const mongoose = require("mongoose");
const {
  normalizeToIST5PM,
  normalizeToCurrentFinacialYear,
} = require("../../transformData/normalizeDates");

module.exports.update_AllGroupsSnapshots = async (
  leafIds,
  userId,
  session = null,
) => {
  if (!leafIds || leafIds.length === 0) {
    throw new Error("No leaf IDs provided");
  }

  const PortfolioGroupModel = mongoose.model("portfolioGroup");
  const FinancialAssetModel = mongoose.model("financialAsset");

  // =========================
  // ! 1. GET ALL GROUPS
  // =========================
  const allGroups = await PortfolioGroupModel.find(
    { userId: new mongoose.Types.ObjectId(userId), isDeleted: false },
    { _id: 1, parentId: 1, path: 1, consolidatedCash: 1 },
  )
    .lean()
    .session(session);

  if (allGroups.length === 0) return;

  // =========================
  // ! 2. AGGREGATE ASSETS
  // =========================
  const assetAgg = await FinancialAssetModel.aggregate([
    {
      $match: {
        portfolioGroupId: {
          $in: leafIds.map((id) => new mongoose.Types.ObjectId(id)),
        },
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$portfolioGroupId",

        investmentValue: {
          $sum: { $cond: ["$status", "$snapshot.investmentValue", 0] },
        },

        currentValue: {
          $sum: { $cond: ["$status", "$snapshot.currentValue", 0] },
        },

        fy_realizedGain: {
          $sum: {
            $cond: ["$status", "$snapshot.financialYear.realizedGain", 0],
          },
        },

        fy_dividend: {
          $sum: { $cond: ["$status", "$snapshot.financialYear.dividend", 0] },
        },

        fy_unrealizedGain: {
          $sum: {
            $cond: ["$status", "$snapshot.financialYear.unrealizedGain", 0],
          },
        },

        fy_startDate: { $first: "$snapshot.financialYear.startDate" },
      },
    },
  ]).session(session);

  // =========================
  // ! 3. LEAF SNAPSHOTS
  // =========================
  const leafSnapshots = {};

  for (const agg of assetAgg) {
    const leafId = agg._id.toString();

    leafSnapshots[leafId] = {
      investmentValue: agg.investmentValue || 0,
      currentValue: agg.currentValue || 0,

      financialYear: {
        startDate: agg.fy_startDate || null,
        realizedGain: agg.fy_realizedGain || 0,
        dividend: agg.fy_dividend || 0,
        unrealizedGain: agg.fy_unrealizedGain || 0,
        totalGain:
          (agg.fy_realizedGain || 0) +
          (agg.fy_dividend || 0) +
          (agg.fy_unrealizedGain || 0),
      },

      irr: 0,
    };
  }

  // ============================
  // ! fill missing leaves
  // ============================
  for (const leafId of leafIds) {
    const idStr = leafId.toString();

    if (!leafSnapshots[idStr]) {
      leafSnapshots[idStr] = {
        investmentValue: 0,
        currentValue: 0,
        financialYear: {
          startDate: null,
          realizedGain: 0,
          dividend: 0,
          unrealizedGain: 0,
          totalGain: 0,
        },
        irr: 0,
      };
    }
  }

  // =========================
  // ! 4. LEVEL MAP
  // =========================
  const levelMap = {};

  for (const group of allGroups) {
    const level = group.path.length + 1;
    if (!levelMap[level]) levelMap[level] = [];
    levelMap[level].push(group);
  }

  const maxLevel = Math.max(...Object.keys(levelMap).map(Number));

  // =========================
  // ! 5. BOTTOM-UP BUILD
  // =========================
  const nodeSnapshots = { ...leafSnapshots };

  for (let level = maxLevel; level >= 1; level--) {
    const nodesAtLevel = levelMap[level] || [];

    for (const node of nodesAtLevel) {
      const nodeId = node._id.toString();

      if (nodeSnapshots[nodeId]) continue;

      const children = allGroups.filter(
        (g) => g.parentId && g.parentId.toString() === nodeId,
      );

      if (children.length === 0) {
        nodeSnapshots[nodeId] = {
          investmentValue: 0,
          currentValue: 0,
          financialYear: {
            startDate: null,
            realizedGain: 0,
            dividend: 0,
            unrealizedGain: 0,
            totalGain: 0,
          },
          irr: 0,
        };
        continue;
      }

      let investmentValue = 0;
      let currentValue = 0;

      let fy_realizedGain = 0;
      let fy_dividend = 0;
      let fy_unrealizedGain = 0;
      let fy_startDate = null;

      for (const child of children) {
        const childSnapshot = nodeSnapshots[child._id.toString()];
        if (!childSnapshot) continue;

        investmentValue += childSnapshot.investmentValue || 0;
        currentValue += childSnapshot.currentValue || 0;

        fy_realizedGain += childSnapshot.financialYear?.realizedGain || 0;
        fy_dividend += childSnapshot.financialYear?.dividend || 0;
        fy_unrealizedGain += childSnapshot.financialYear?.unrealizedGain || 0;

        if (childSnapshot.financialYear?.startDate && !fy_startDate) {
          fy_startDate = childSnapshot.financialYear.startDate;
        }
      }

      nodeSnapshots[nodeId] = {
        investmentValue,
        currentValue,

        financialYear: {
          startDate: fy_startDate,
          realizedGain: fy_realizedGain,
          dividend: fy_dividend,
          unrealizedGain: fy_unrealizedGain,
          totalGain: fy_realizedGain + fy_dividend + fy_unrealizedGain,
        },
        irr: 0,
      };
    }
  }

  // =========================
  // ! 6. BULK UPDATE
  // =========================
  const bulkOps = [];

  for (const group of allGroups) {
    const groupId = group._id.toString();
    const snapshot = nodeSnapshots[groupId];

    if (!snapshot) continue;

    const consolidatedCurrentValue =
      snapshot.currentValue + (group.consolidatedCash || 0);
    snapshot.financialYear.startDate = normalizeToCurrentFinacialYear();
    bulkOps.push({
      updateOne: {
        filter: { _id: group._id },
        update: {
          $set: {
            "groupSnapshot.investmentValue": snapshot.investmentValue,
            "groupSnapshot.currentValue": snapshot.currentValue,
            "groupSnapshot.financialYear": snapshot.financialYear,
            consolidatedCurrentValue,
          },
        },
      },
    });
  }

  if (bulkOps.length > 0) {
    await PortfolioGroupModel.bulkWrite(bulkOps, { session });
  }
  return { success: true, updatedCount: bulkOps.length };
};
