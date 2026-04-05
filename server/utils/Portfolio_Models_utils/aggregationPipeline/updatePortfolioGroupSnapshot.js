const mongoose = require("mongoose");

const PortfolioGroupModel = mongoose.model("portfolioGroup");
const FinancialAssetModel = mongoose.model("financialAsset");

/**
 * Updates the entire portfolio group tree snapshots starting from leaf nodes.
 * 
 * @param {string[]} leafIds - Array of leaf portfolio group IDs
 * @param {string} userId - User ID
 * @param {object} session - Mongoose session for transactions
 */
module.exports.updatePortfolioGroupTree = async (leafIds, userId, session = null) => {
  if (!leafIds || leafIds.length === 0) {
    throw new Error("No leaf IDs provided");
  }

  // =========================
  // 1. GET ALL GROUPS FOR USER
  // =========================
  const allGroups = await PortfolioGroupModel.find(
    { userId: new mongoose.Types.ObjectId(userId), isDeleted: false },
    { _id: 1, parentId: 1, path: 1, consolidatedCash: 1 }
  )
    .lean()
    .session(session);

  if (allGroups.length === 0) return;

  const groupMap = {};
  for (const g of allGroups) {
    groupMap[g._id.toString()] = g;
  }

  // =========================
  // 2. AGGREGATE FINANCIAL ASSETS BY LEAF
  // =========================
  const assetAgg = await FinancialAssetModel.aggregate([
    {
      $match: {
        portfolioGroupId: { $in: leafIds.map(id => new mongoose.Types.ObjectId(id)) },
        userId: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $group: {
        _id: "$portfolioGroupId",
        // Position (only active assets)
        investmentValue: {
          $sum: { $cond: ["$status", "$snapshot.investmentValue", 0] },
        },
        currentValue: {
          $sum: { $cond: ["$status", "$snapshot.currentValue", 0] },
        },
        // Lifetime (ALL assets, active + inactive)
        lifetime_realizedGain: { $sum: "$snapshot.lifetime.realizedGain" },
        lifetime_dividend: { $sum: "$snapshot.lifetime.dividend" },
        // Financial Year (only active assets)
        fy_realizedGain: {
          $sum: { $cond: ["$status", "$snapshot.financialYear.realizedGain", 0] },
        },
        fy_dividend: {
          $sum: { $cond: ["$status", "$snapshot.financialYear.dividend", 0] },
        },
        fy_unrealizedGain: {
          $sum: { $cond: ["$status", "$snapshot.financialYear.unrealizedGain", 0] },
        },
        fy_startDate: { $first: "$snapshot.financialYear.startDate" },
      },
    },
  ]).session(session);

  // Map aggregated data
  const leafSnapshots = {};
  for (const agg of assetAgg) {
    const leafId = agg._id.toString();
    leafSnapshots[leafId] = {
      investmentValue: agg.investmentValue || 0,
      currentValue: agg.currentValue || 0,
      lifetime: {
        realizedGain: agg.lifetime_realizedGain || 0,
        dividend: agg.lifetime_dividend || 0,
      },
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

  // Initialize missing leaves with zero snapshots
  for (const leafId of leafIds) {
    const idStr = leafId.toString();
    if (!leafSnapshots[idStr]) {
      leafSnapshots[idStr] = {
        investmentValue: 0,
        currentValue: 0,
        lifetime: { realizedGain: 0, dividend: 0 },
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
  // 3. BUILD LEVEL MAP (for bottom-up traversal)
  // =========================
  const levelMap = {};
  for (const group of allGroups) {
    const level = group.path.length + 1;
    if (!levelMap[level]) levelMap[level] = [];
    levelMap[level].push(group);
  }

  const maxLevel = Math.max(...Object.keys(levelMap).map(Number));

  // =========================
  // 4. BOTTOM-UP AGGREGATION
  // =========================
  const nodeSnapshots = { ...leafSnapshots };

  for (let level = maxLevel; level >= 1; level--) {
    const nodesAtLevel = levelMap[level] || [];

    for (const node of nodesAtLevel) {
      const nodeId = node._id.toString();

      // If this node already has a snapshot (it's a leaf or was computed), skip aggregation
      if (nodeSnapshots[nodeId]) continue;

      // Find all children of this node
      const children = allGroups.filter(
        g => g.parentId && g.parentId.toString() === nodeId
      );

      if (children.length === 0) {
        // No children, initialize with zeros
        nodeSnapshots[nodeId] = {
          investmentValue: 0,
          currentValue: 0,
          lifetime: { realizedGain: 0, dividend: 0 },
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

      // Aggregate children
      let investmentValue = 0;
      let currentValue = 0;
      let lifetime_realizedGain = 0;
      let lifetime_dividend = 0;
      let fy_realizedGain = 0;
      let fy_dividend = 0;
      let fy_unrealizedGain = 0;
      let fy_startDate = null;

      for (const child of children) {
        const childId = child._id.toString();
        const childSnapshot = nodeSnapshots[childId];

        if (!childSnapshot) continue;

        investmentValue += childSnapshot.investmentValue || 0;
        currentValue += childSnapshot.currentValue || 0;
        lifetime_realizedGain += childSnapshot.lifetime?.realizedGain || 0;
        lifetime_dividend += childSnapshot.lifetime?.dividend || 0;
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
        lifetime: {
          realizedGain: lifetime_realizedGain,
          dividend: lifetime_dividend,
        },
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
  // 5. BULK UPDATE
  // =========================
  const bulkOps = [];

  for (const group of allGroups) {
    const groupId = group._id.toString();
    const snapshot = nodeSnapshots[groupId];

    if (!snapshot) continue;

    const consolidatedCurrentValue = snapshot.currentValue + (group.consolidatedCash || 0);

    bulkOps.push({
      updateOne: {
        filter: { _id: group._id },
        update: {
          $set: {
            groupSnapshot: snapshot,
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