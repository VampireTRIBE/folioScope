const mongoose = require("mongoose");

const {
  normalizeToIST5PM,
  normalizeToISTEndOfDay,
  normalizeToIST330PM,
} = require("../../utils/transformData/normalizeDates");
const {
  get_NavMeta,
} = require("../../utils/mongodb/aggregations/get_NavMeta");
const {
  get_GroupIDsByUser,
} = require("../../utils/mongodb/aggregations/get_GroupIDsByUser");
const {
  get_GroupAssetQtyMap,
} = require("../../utils/mongodb/aggregations/get_GroupAssetQtyMap");
const {
  get_GroupWithCurrentValueMap,
} = require("../../utils/mongodb/aggregations/get_GroupWithCurrentValueMap");
const {
  get_PeriodCloses,
} = require("../../utils/mongodb/aggregations/get_AssetsPrice");
const {
  get_GroupChildrenMap,
} = require("../../utils/mongodb/aggregations/get_GroupChildrenMap");

const BULK_WRITE_SIZE = 500;
const NUMBER_EPSILON = 1e-8;

const toIdString = (value) => {
  if (value === null || value === undefined) return null;
  return value.toString();
};

const toFiniteNumber = ({ value, fieldName, context }) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    throw new Error(
      `Invalid ${fieldName} in ${context}: received ${String(value)}`,
    );
  }

  return numericValue;
};

const normalizeChildrenMap = (parentChildren = {}) => {
  const normalized = {};
  const allGroupIds = new Set();

  for (const [rawParentId, rawChildren] of Object.entries(parentChildren)) {
    const parentId = toIdString(rawParentId);
    const children = (rawChildren || []).map(toIdString).filter(Boolean);

    allGroupIds.add(parentId);
    children.forEach((childId) => allGroupIds.add(childId));
    normalized[parentId] = children;
  }

  for (const groupId of allGroupIds) {
    normalized[groupId] = normalized[groupId] || [];
  }

  return normalized;
};

/**
 * Returns every group from leaf to root.
 *
 * A cycle is rejected because a cyclic hierarchy makes consolidated NAV
 * mathematically undefined.
 */
const getSortedLeafToRoot = (parentChildren) => {
  const normalizedChildren = normalizeChildrenMap(parentChildren);
  const depthMap = {};
  const visiting = new Set();

  const getDepth = (groupId) => {
    if (depthMap[groupId] !== undefined) return depthMap[groupId];

    if (visiting.has(groupId)) {
      throw new Error(`Cycle detected in group hierarchy at ${groupId}`);
    }

    visiting.add(groupId);

    const children = normalizedChildren[groupId] || [];

    if (children.length === 0) {
      depthMap[groupId] = 0;
    } else {
      depthMap[groupId] =
        Math.max(...children.map((childId) => getDepth(childId))) + 1;
    }

    visiting.delete(groupId);
    return depthMap[groupId];
  };

  for (const groupId of Object.keys(normalizedChildren)) {
    getDepth(groupId);
  }

  return Object.keys(normalizedChildren).sort(
    (first, second) => depthMap[first] - depthMap[second],
  );
};

const getStoredStateValue = ({ state, groupId }) => {
  if (state?.value !== undefined && state?.value !== null) {
    return toFiniteNumber({
      value: state.value,
      fieldName: "value",
      context: `NAV state for group ${groupId}`,
    });
  }

  const nav = toFiniteNumber({
    value: state?.nav ?? 0,
    fieldName: "nav",
    context: `NAV state for group ${groupId}`,
  });
  const units = toFiniteNumber({
    value: state?.units ?? 0,
    fieldName: "units",
    context: `NAV state for group ${groupId}`,
  });

  return nav * units;
};

const flushBulkOperations = async ({ model, operations, session }) => {
  if (operations.length === 0) return;

  await model.bulkWrite(operations, {
    session,
    ordered: true,
  });

  operations.length = 0;
};

/**
 * Pure helper for a deposit or withdrawal.
 *
 * Call this separately for the leaf and every ancestor using that group's own
 * pre-flow value and units. Never reuse the leaf's unitChange for a parent.
 */
const calculateExternalFlowUnitUpdate = ({
  currentValue,
  currentUnits,
  amount,
  type,
}) => {
  const normalizedType = String(type || "").trim().toLowerCase();

  if (!["deposit", "withdrawal"].includes(normalizedType)) {
    throw new Error(`Unsupported external-flow type: ${type}`);
  }

  const value = toFiniteNumber({
    value: currentValue,
    fieldName: "currentValue",
    context: "external NAV flow",
  });
  const units = toFiniteNumber({
    value: currentUnits,
    fieldName: "currentUnits",
    context: "external NAV flow",
  });
  const flowAmount = toFiniteNumber({
    value: amount,
    fieldName: "amount",
    context: "external NAV flow",
  });

  if (value < -NUMBER_EPSILON || units < -NUMBER_EPSILON) {
    throw new Error("External NAV flow received negative value or units");
  }

  if (flowAmount <= 0) {
    throw new Error("External NAV flow amount must be greater than zero");
  }

  if (units <= NUMBER_EPSILON && Math.abs(value) > NUMBER_EPSILON) {
    throw new Error("A group with value cannot have zero units");
  }

  const preFlowNav = units > NUMBER_EPSILON ? value / units : 100;

  if (!Number.isFinite(preFlowNav) || preFlowNav <= 0) {
    throw new Error(`Invalid pre-flow NAV: ${preFlowNav}`);
  }

  const unitChange = flowAmount / preFlowNav;
  const updatedUnits =
    normalizedType === "deposit" ? units + unitChange : units - unitChange;
  const updatedValue =
    normalizedType === "deposit" ? value + flowAmount : value - flowAmount;

  if (updatedUnits < -NUMBER_EPSILON || updatedValue < -NUMBER_EPSILON) {
    throw new Error(`${normalizedType} exceeds the group's value or units`);
  }

  return {
    preFlowNav,
    unitChange,
    units: Math.abs(updatedUnits) <= NUMBER_EPSILON ? 0 : updatedUnits,
    value: Math.abs(updatedValue) <= NUMBER_EPSILON ? 0 : updatedValue,
    nav: preFlowNav,
  };
};

module.exports.getSortedLeafToRoot = getSortedLeafToRoot;
module.exports.calculateExternalFlowUnitUpdate =
  calculateExternalFlowUnitUpdate;

/**
 * Fills market-only NAV gaps.
 *
 * Critical invariant:
 *   Market movement changes value and NAV, but never changes units.
 *
 * This function assumes there are no unprocessed external flows inside the
 * supplied gap. Deposit and withdrawal handlers must first issue or cancel
 * units independently for the leaf and every ancestor.
 */
module.exports.fill_MissingNAVs = async (
  userId,
  session = null,
  startDate = null,
  endDate = null,
) => {
  if (!session) {
    throw new Error("session required");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  if (!startDate) {
    throw new Error("Start date is missing");
  }

  if (!endDate) {
    throw new Error("End date is missing");
  }

  const NAV_Model = mongoose.model("navPerformence");
  const normalizedStartDate = normalizeToIST5PM(new Date(startDate));
  const normalizedEndDate = normalizeToISTEndOfDay(new Date(endDate));
  const lastDate = normalizeToIST5PM(new Date(normalizedEndDate));

  if (
    Number.isNaN(normalizedStartDate.getTime()) ||
    Number.isNaN(normalizedEndDate.getTime())
  ) {
    throw new Error("Invalid startDate or endDate");
  }

  if (normalizedStartDate > normalizedEndDate) {
    throw new Error("startDate cannot be after endDate");
  }

  const lastNAVdateDocMap = await get_NavMeta(
    userId,
    normalizedStartDate,
    session,
  );

  if (!lastNAVdateDocMap.lastDate) {
    const allGroupIds = await get_GroupIDsByUser({ userId, session });
    const bulkOperations = allGroupIds.map((groupId) => ({
      insertOne: {
        document: {
          portfolioGroupId: groupId,
          userId,
          message: "default",
          date: new Date(lastDate),
          nav: 100,
          units: 0,
          value: 0,
        },
      },
    }));

    if (bulkOperations.length > 0) {
      await NAV_Model.bulkWrite(bulkOperations, {
        session,
        ordered: true,
      });
    }

    return {
      message: "No NAV document was found. Default NAV documents were created.",
      insertedDocuments: bulkOperations.length,
      updatedDocuments: 0,
    };
  }

  const newGroupIds = (lastNAVdateDocMap.nullDate || []).map(toIdString);
  const oldGroupStates = lastNAVdateDocMap.nonNullDate || {};
  const leafGroupIds = lastNAVdateDocMap.leafGroup || [];

  const [pastCloses, leafGroupQtyMap, leafGroupCurrentValueMap] =
    await Promise.all([
      get_PeriodCloses(
        new Date(normalizedStartDate),
        normalizedEndDate,
        session,
      ),
      get_GroupAssetQtyMap(userId, session),
      get_GroupWithCurrentValueMap(leafGroupIds, userId, session),
    ]);

  const currentState = {};

  for (const [rawGroupId, state] of Object.entries(oldGroupStates)) {
    const groupId = toIdString(rawGroupId);
    currentState[groupId] = {
      nav: toFiniteNumber({
        value: state?.nav ?? 100,
        fieldName: "nav",
        context: `initial state for group ${groupId}`,
      }),
      units: toFiniteNumber({
        value: state?.units ?? 0,
        fieldName: "units",
        context: `initial state for group ${groupId}`,
      }),
      value: getStoredStateValue({ state, groupId }),
    };
  }

  if (newGroupIds.length > 0) {
    const defaultGroupOperations = newGroupIds.map((groupId) => ({
      updateOne: {
        filter: {
          portfolioGroupId: groupId,
          userId,
          date: new Date(lastDate),
        },
        update: {
          $set: {
            message: "default",
            nav: 100,
            units: 0,
            value: 0,
          },
        },
        upsert: true,
      },
    }));

    await NAV_Model.bulkWrite(defaultGroupOperations, {
      session,
      ordered: true,
    });

    for (const groupId of newGroupIds) {
      currentState[groupId] = {
        nav: 100,
        units: 0,
        value: 0,
      };
    }
  }

  const rawParentChildren = await get_GroupChildrenMap(userId, session);
  const parentChildren = normalizeChildrenMap(rawParentChildren);
  const leafToRoot = getSortedLeafToRoot(parentChildren);

  let bulkOperations = [];
  let updatedDocuments = 0;
  const cursorDate = new Date(normalizedStartDate);

  while (cursorDate < normalizedEndDate) {
    const navDate = normalizeToIST5PM(new Date(cursorDate));
    const priceDate = normalizeToIST330PM(new Date(cursorDate));
    const priceDateKey = priceDate.toISOString();
    const pricesForDate = pastCloses?.[priceDateKey];

    for (const groupId of leafToRoot) {
      const existingState = currentState[groupId];

      if (!existingState) {
        throw new Error(
          `Missing NAV state for group ${groupId} on ${navDate.toISOString()}`,
        );
      }

      const children = parentChildren[groupId] || [];
      let nav = 100;
      let units = toFiniteNumber({
        value: existingState.units ?? 0,
        fieldName: "units",
        context: `group ${groupId} on ${navDate.toISOString()}`,
      });
      let totalValue = 0;

      if (units < -NUMBER_EPSILON) {
        throw new Error(`Group ${groupId} has negative units: ${units}`);
      }

      if (children.length === 0) {
        // LEAF NODE
        const idleCash = toFiniteNumber({
          value: leafGroupCurrentValueMap?.[groupId] ?? 0,
          fieldName: "idle cash",
          context: `leaf group ${groupId}`,
        });

        let marketValue = 0;
        const assetQuantityMap = leafGroupQtyMap?.[groupId] || {};

        for (const [assetId, rawQuantity] of Object.entries(assetQuantityMap)) {
          const quantity = toFiniteNumber({
            value: rawQuantity,
            fieldName: "asset quantity",
            context: `asset ${assetId} in group ${groupId}`,
          });

          if (Math.abs(quantity) <= NUMBER_EPSILON) continue;

          const closePrice = toFiniteNumber({
            value: pricesForDate?.[assetId],
            fieldName: "close price",
            context: `asset ${assetId} on ${priceDateKey}`,
          });

          marketValue += quantity * closePrice;
        }

        totalValue = idleCash + marketValue;
        nav = units > NUMBER_EPSILON ? totalValue / units : 100;
      } else {
        // PARENT NODE
        // Child values are additive. Child units are not additive.
        // Preserve this parent's independently maintained units.
        for (const childId of children) {
          const childState = currentState[childId];

          if (!childState) {
            throw new Error(
              `Missing NAV state for child ${childId} of parent ${groupId}`,
            );
          }

          totalValue += getStoredStateValue({
            state: childState,
            groupId: childId,
          });
        }

        if (units > NUMBER_EPSILON) {
          nav = totalValue / units;
        } else if (Math.abs(totalValue) <= NUMBER_EPSILON) {
          nav = 100;
          units = 0;
          totalValue = 0;
        } else {
          throw new Error(
            `Parent group ${groupId} has value ${totalValue} but zero units. ` +
              "The deposit/withdrawal NAV handler did not maintain parent units.",
          );
        }
      }

      if (!Number.isFinite(nav) || nav < 0) {
        throw new Error(
          `Calculated invalid NAV ${nav} for group ${groupId} on ` +
            navDate.toISOString(),
        );
      }

      if (!Number.isFinite(totalValue) || totalValue < -NUMBER_EPSILON) {
        throw new Error(
          `Calculated invalid value ${totalValue} for group ${groupId} on ` +
            navDate.toISOString(),
        );
      }

      currentState[groupId] = {
        nav,
        units,
        value: totalValue,
      };

      bulkOperations.push({
        updateOne: {
          filter: {
            portfolioGroupId: groupId,
            userId,
            date: navDate,
          },
          update: {
            $set: {
              message: "market",
              nav,
              units,
              value: totalValue,
            },
          },
          upsert: true,
        },
      });

      updatedDocuments += 1;

      if (bulkOperations.length >= BULK_WRITE_SIZE) {
        await flushBulkOperations({
          model: NAV_Model,
          operations: bulkOperations,
          session,
        });
      }
    }

    cursorDate.setUTCDate(cursorDate.getUTCDate() + 1);
  }

  await flushBulkOperations({
    model: NAV_Model,
    operations: bulkOperations,
    session,
  });

  return {
    message: "Missing NAV documents filled successfully",
    insertedDefaultGroups: newGroupIds.length,
    updatedDocuments,
  };
};
