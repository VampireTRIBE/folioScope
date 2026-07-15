#!/usr/bin/env node

/*
 * Repairs non-leaf NAV units and NAV values without modifying leaf NAVs.
 *
 * Default mode is dry-run. Nothing is written unless --apply is supplied.
 * Apply mode creates a complete backup collection before changing documents.
 *
 * Usage (from the server directory):
 *   MONGO_URI="mongodb://..." node scripts/repairParentNAVs.js --user=<USER_ID>
 *   MONGO_URI="mongodb://..." node scripts/repairParentNAVs.js --user=<USER_ID> --apply
 *   MONGO_URI="mongodb://..." node scripts/repairParentNAVs.js \
 *     --user=<USER_ID> --restore=<BACKUP_COLLECTION>
 */

const IST_OFFSET_MINUTES = 330;
const NAV_CUTOFF_UTC_HOUR = 11;
const NAV_CUTOFF_UTC_MINUTE = 30;
const DEFAULT_TOLERANCE = 1e-6;
const BULK_SIZE = 500;

const getCollectionNames = () => ({
  nav: process.env.NAV_COLLECTION || "navperformences",
  groups: process.env.GROUP_COLLECTION || "portfoliogroups",
  groupStatements:
    process.env.GROUP_STATEMENT_COLLECTION || "groupstatements",
  ledgerStatements:
    process.env.LEDGER_STATEMENT_COLLECTION || "ledgerstatements",
  financialAssets:
    process.env.FINANCIAL_ASSET_COLLECTION || "financialassets",
  priceHistory:
    process.env.PRICE_HISTORY_COLLECTION || "assetpricehistories",
});

const idString = (value) => {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") return value;
  if (value.$oid) return value.$oid;
  return value.toString();
};

const asDate = (value) => {
  const source = value?.$date ?? value;
  const parsed = source instanceof Date ? new Date(source) : new Date(source);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${String(source)}`);
  }

  return parsed;
};

const finiteNumber = ({ value, fieldName, context }) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    throw new Error(
      `Invalid ${fieldName} in ${context}: received ${String(value)}`,
    );
  }

  return parsed;
};

const nearlyEqual = (first, second, tolerance = DEFAULT_TOLERANCE) =>
  Math.abs(Number(first) - Number(second)) <= tolerance;

const roundForLog = (value, decimals = 10) =>
  Number(Number(value).toFixed(decimals));

const getISTParts = (dateValue) => {
  const date = asDate(dateValue);
  const shifted = new Date(date.getTime() + IST_OFFSET_MINUTES * 60_000);

  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth(),
    day: shifted.getUTCDate(),
  };
};

const toDateKey = (dateValue) => {
  const { year, month, day } = getISTParts(dateValue);
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const getNAVCutoff = (dateValue) => {
  const { year, month, day } = getISTParts(dateValue);

  return new Date(
    Date.UTC(
      year,
      month,
      day,
      NAV_CUTOFF_UTC_HOUR,
      NAV_CUTOFF_UTC_MINUTE,
      0,
      0,
    ),
  );
};

const groupBy = (rows, getKey) => {
  const result = new Map();

  for (const row of rows) {
    const key = getKey(row);
    if (!result.has(key)) result.set(key, []);
    result.get(key).push(row);
  }

  return result;
};

const buildHierarchy = (groups) => {
  const groupMap = new Map();
  const childrenMap = new Map();

  for (const group of groups) {
    const groupId = idString(group._id);
    if (!groupId) throw new Error("Portfolio group without _id");
    if (groupMap.has(groupId)) throw new Error(`Duplicate group ${groupId}`);

    groupMap.set(groupId, group);
    childrenMap.set(groupId, []);
  }

  for (const group of groups) {
    const groupId = idString(group._id);
    const parentId = idString(group.parentId);

    if (!parentId) continue;
    if (!groupMap.has(parentId)) {
      throw new Error(`Group ${groupId} references missing parent ${parentId}`);
    }

    childrenMap.get(parentId).push(groupId);
  }

  const roots = groups
    .filter((group) => !idString(group.parentId))
    .map((group) => idString(group._id));

  if (roots.length !== 1) {
    throw new Error(`Expected one root group, found ${roots.length}`);
  }

  const visiting = new Set();
  const visited = new Set();

  const assertAcyclic = (groupId) => {
    if (visited.has(groupId)) return;
    if (visiting.has(groupId)) {
      throw new Error(`Cycle detected at group ${groupId}`);
    }

    visiting.add(groupId);
    for (const childId of childrenMap.get(groupId) || []) {
      assertAcyclic(childId);
    }
    visiting.delete(groupId);
    visited.add(groupId);
  };

  assertAcyclic(roots[0]);

  // With exactly one root, any unvisited component can only be a cycle
  // (missing parents were rejected above). Walk it so the error identifies
  // the real corruption instead of reporting a generic disconnection.
  for (const groupId of groupMap.keys()) {
    if (!visited.has(groupId)) {
      assertAcyclic(groupId);
    }
  }

  if (visited.size !== groups.length) {
    throw new Error("The group hierarchy contains disconnected groups");
  }

  const leafIds = new Set(
    [...childrenMap.entries()]
      .filter(([, children]) => children.length === 0)
      .map(([groupId]) => groupId),
  );
  const parentIds = new Set(
    [...childrenMap.entries()]
      .filter(([, children]) => children.length > 0)
      .map(([groupId]) => groupId),
  );

  const ancestorsByGroup = new Map();

  for (const groupId of groupMap.keys()) {
    const ancestors = [];
    const seen = new Set();
    let currentId = groupId;

    while (currentId) {
      if (seen.has(currentId)) {
        throw new Error(`Cycle detected while resolving ${groupId}`);
      }

      seen.add(currentId);
      ancestors.push(currentId);
      currentId = idString(groupMap.get(currentId)?.parentId);
    }

    ancestorsByGroup.set(groupId, ancestors);
  }

  const descendantLeavesByGroup = new Map();

  const getDescendantLeaves = (groupId) => {
    if (descendantLeavesByGroup.has(groupId)) {
      return descendantLeavesByGroup.get(groupId);
    }

    const children = childrenMap.get(groupId) || [];
    const leaves =
      children.length === 0
        ? [groupId]
        : children.flatMap((childId) => getDescendantLeaves(childId));

    descendantLeavesByGroup.set(groupId, leaves);
    return leaves;
  };

  for (const groupId of groupMap.keys()) {
    getDescendantLeaves(groupId);
  }

  return {
    rootId: roots[0],
    groupMap,
    childrenMap,
    leafIds,
    parentIds,
    ancestorsByGroup,
    descendantLeavesByGroup,
  };
};

const createPriceLookup = (priceRows) => {
  const sortedByMetadata = groupBy(priceRows, (row) => idString(row.assetId));

  for (const [metadataId, rows] of sortedByMetadata) {
    rows.sort((first, second) => asDate(first.date) - asDate(second.date));

    let previousTimestamp = null;
    for (const row of rows) {
      const timestamp = asDate(row.date).getTime();
      if (timestamp === previousTimestamp) {
        throw new Error(
          `Duplicate price timestamp for metadata ${metadataId}: ${asDate(row.date).toISOString()}`,
        );
      }
      previousTimestamp = timestamp;
    }
  }

  return (metadataId, cutoffDate) => {
    const rows = sortedByMetadata.get(idString(metadataId)) || [];
    const cutoffTime = asDate(cutoffDate).getTime();
    let low = 0;
    let high = rows.length - 1;
    let result = null;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const rowTime = asDate(rows[middle].date).getTime();

      if (rowTime <= cutoffTime) {
        result = rows[middle];
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    return result;
  };
};

const createUnitsReader = (timelineByGroup) => {
  const sortedTimelineByGroup = new Map();

  for (const [groupId, dayMap] of timelineByGroup) {
    sortedTimelineByGroup.set(
      groupId,
      [...dayMap.entries()]
        .map(([dateKey, units]) => ({ dateKey, units }))
        .sort((first, second) => first.dateKey.localeCompare(second.dateKey)),
    );
  }

  return (groupId, dateKey) => {
    const timeline = sortedTimelineByGroup.get(groupId) || [];
    let low = 0;
    let high = timeline.length - 1;
    let units = 0;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);

      if (timeline[middle].dateKey <= dateKey) {
        units = timeline[middle].units;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    return units;
  };
};

/**
 * Replays the complete transaction history and issues units independently for
 * each affected group. This is the core correction algorithm.
 */
const replayIndependentUnits = ({
  groups,
  groupStatements,
  ledgerStatements,
  financialAssets,
  priceRows,
  tolerance = DEFAULT_TOLERANCE,
}) => {
  const hierarchy = buildHierarchy(groups);
  const financialAssetMap = new Map(
    financialAssets.map((asset) => [idString(asset._id), asset]),
  );
  const getPrice = createPriceLookup(priceRows);
  const cashByLeaf = new Map(
    [...hierarchy.leafIds].map((leafId) => [leafId, 0]),
  );
  const quantityByAsset = new Map();
  const unitsByGroup = new Map(
    [...hierarchy.groupMap.keys()].map((groupId) => [groupId, 0]),
  );
  const timelineByGroup = new Map(
    [...hierarchy.groupMap.keys()].map((groupId) => [groupId, new Map()]),
  );

  const valueAtGroup = ({ groupId, eventDate }) => {
    const leafIds = new Set(
      hierarchy.descendantLeavesByGroup.get(groupId) || [],
    );
    const cutoff = getNAVCutoff(eventDate);
    let value = 0;

    for (const leafId of leafIds) {
      value += finiteNumber({
        value: cashByLeaf.get(leafId) ?? 0,
        fieldName: "cash",
        context: `leaf group ${leafId}`,
      });
    }

    for (const [financialAssetId, rawQuantity] of quantityByAsset) {
      const quantity = finiteNumber({
        value: rawQuantity,
        fieldName: "quantity",
        context: `financial asset ${financialAssetId}`,
      });

      if (Math.abs(quantity) <= tolerance) continue;

      const financialAsset = financialAssetMap.get(financialAssetId);
      if (!financialAsset) {
        throw new Error(`Missing financial asset ${financialAssetId}`);
      }

      const assetLeafId = idString(financialAsset.portfolioGroupId);
      if (!leafIds.has(assetLeafId)) continue;

      const metadataId = idString(financialAsset.assetMetadataId);
      const priceRow = getPrice(metadataId, cutoff);

      if (!priceRow) {
        throw new Error(
          `Missing close price for ${financialAsset.name || financialAssetId} ` +
            `at or before ${cutoff.toISOString()}`,
        );
      }

      const close = finiteNumber({
        value: priceRow.close,
        fieldName: "close",
        context: `price record ${idString(priceRow._id)}`,
      });

      if (close <= 0) {
        throw new Error(
          `Non-positive close for metadata ${metadataId}: ${close}`,
        );
      }

      value += quantity * close;
    }

    return value;
  };

  const events = [
    ...groupStatements.map((row) => ({
      source: "groupStatement",
      sourceOrder: 0,
      row,
      date: asDate(row.date),
    })),
    ...ledgerStatements.map((row) => ({
      source: "ledgerStatement",
      sourceOrder: 1,
      row,
      date: asDate(row.date),
    })),
  ].sort((first, second) => {
    const timeDifference = first.date - second.date;
    if (timeDifference !== 0) return timeDifference;
    return first.sourceOrder - second.sourceOrder;
  });

  let minimumCash = 0;
  let eventCount = 0;

  for (const event of events) {
    const row = event.row;
    const eventId = idString(row._id) || "unknown";
    const eventType = String(row.type || "").trim().toLowerCase();
    const leafId = idString(row.portfolioGroupId);
    const dateKey = toDateKey(event.date);

    if (!hierarchy.leafIds.has(leafId)) {
      throw new Error(
        `${event.source} ${eventId} is attached to non-leaf group ${leafId}`,
      );
    }

    if (event.source === "groupStatement") {
      const amount = finiteNumber({
        value: row.amount,
        fieldName: "amount",
        context: `group statement ${eventId}`,
      });

      if (amount < 0) {
        throw new Error(`Negative group-statement amount in ${eventId}`);
      }

      if (eventType === "deposit" || eventType === "withdrawal") {
        const affectedGroups = hierarchy.ancestorsByGroup.get(leafId) || [];
        const preFlowValues = new Map(
          affectedGroups.map((groupId) => [
            groupId,
            valueAtGroup({ groupId, eventDate: event.date }),
          ]),
        );

        for (const groupId of affectedGroups) {
          const existingUnits = unitsByGroup.get(groupId) ?? 0;
          const preFlowValue = preFlowValues.get(groupId) ?? 0;
          let issueNav = 100;

          if (existingUnits > tolerance) {
            issueNav = preFlowValue / existingUnits;
            if (!Number.isFinite(issueNav) || issueNav <= 0) {
              throw new Error(
                `Invalid pre-flow NAV ${issueNav} for group ${groupId} ` +
                  `during statement ${eventId}`,
              );
            }
          } else if (Math.abs(preFlowValue) > tolerance) {
            throw new Error(
              `Group ${groupId} has pre-flow value ${preFlowValue} but zero units ` +
                `during statement ${eventId}`,
            );
          }

          const unitChange = amount / issueNav;
          const updatedUnits =
            eventType === "deposit"
              ? existingUnits + unitChange
              : existingUnits - unitChange;

          if (updatedUnits < -tolerance) {
            throw new Error(
              `Withdrawal ${eventId} creates negative units in group ${groupId}`,
            );
          }

          const normalizedUnits =
            Math.abs(updatedUnits) <= tolerance ? 0 : updatedUnits;

          unitsByGroup.set(groupId, normalizedUnits);
          timelineByGroup.get(groupId).set(dateKey, normalizedUnits);
        }

        const currentCash = cashByLeaf.get(leafId) ?? 0;
        cashByLeaf.set(
          leafId,
          eventType === "deposit"
            ? currentCash + amount
            : currentCash - amount,
        );
      } else if (eventType === "tax") {
        cashByLeaf.set(leafId, (cashByLeaf.get(leafId) ?? 0) - amount);
      } else {
        throw new Error(
          `Unsupported group-statement type "${row.type}" in ${eventId}`,
        );
      }
    } else {
      const financialAssetId = idString(row.financialAssetId);
      const financialAsset = financialAssetMap.get(financialAssetId);

      if (!financialAsset) {
        throw new Error(
          `Ledger statement ${eventId} references missing asset ${financialAssetId}`,
        );
      }

      if (idString(financialAsset.portfolioGroupId) !== leafId) {
        throw new Error(
          `Ledger statement ${eventId} group does not match asset group`,
        );
      }

      const amount = finiteNumber({
        value: row.amount,
        fieldName: "amount",
        context: `ledger statement ${eventId}`,
      });
      const currentCash = cashByLeaf.get(leafId) ?? 0;

      if (eventType === "buy" || eventType === "sell") {
        const quantity = finiteNumber({
          value: row.qty,
          fieldName: "quantity",
          context: `ledger statement ${eventId}`,
        });

        if (quantity < 0) {
          throw new Error(`Negative quantity in ledger statement ${eventId}`);
        }

        const existingQuantity = quantityByAsset.get(financialAssetId) ?? 0;
        const updatedQuantity =
          eventType === "buy"
            ? existingQuantity + quantity
            : existingQuantity - quantity;

        if (updatedQuantity < -tolerance) {
          throw new Error(
            `Sell ${eventId} creates negative quantity for ${financialAssetId}`,
          );
        }

        quantityByAsset.set(
          financialAssetId,
          Math.abs(updatedQuantity) <= tolerance ? 0 : updatedQuantity,
        );
        cashByLeaf.set(
          leafId,
          eventType === "buy" ? currentCash - amount : currentCash + amount,
        );
      } else if (eventType === "dividend") {
        cashByLeaf.set(leafId, currentCash + amount);
      } else {
        throw new Error(
          `Unsupported ledger-statement type "${row.type}" in ${eventId}`,
        );
      }
    }

    const currentLeafCash = cashByLeaf.get(leafId) ?? 0;
    minimumCash = Math.min(minimumCash, currentLeafCash);

    if (currentLeafCash < -tolerance) {
      throw new Error(
        `Transaction sequence creates negative cash ${currentLeafCash} in ` +
          `leaf group ${leafId} after ${event.source} ${eventId}`,
      );
    }

    eventCount += 1;
  }

  return {
    hierarchy,
    unitsByGroup,
    timelineByGroup,
    getUnitsAtOrBefore: createUnitsReader(timelineByGroup),
    finalCashByLeaf: cashByLeaf,
    finalQuantityByAsset: quantityByAsset,
    eventCount,
    minimumCash,
  };
};

const buildParentRepairs = ({
  navRows,
  replay,
  tolerance = DEFAULT_TOLERANCE,
}) => {
  const { hierarchy, getUnitsAtOrBefore } = replay;
  const navByGroupAndDay = new Map();
  const navRowsByGroup = groupBy(navRows, (row) =>
    idString(row.portfolioGroupId),
  );

  for (const navRow of navRows) {
    const groupId = idString(navRow.portfolioGroupId);
    const dateKey = toDateKey(navRow.date);
    const key = `${groupId}|${dateKey}`;

    if (navByGroupAndDay.has(key)) {
      throw new Error(`Duplicate NAV day: ${key}`);
    }

    navByGroupAndDay.set(key, navRow);
  }

  const leafUnitMismatches = [];

  for (const leafId of hierarchy.leafIds) {
    for (const navRow of navRowsByGroup.get(leafId) || []) {
      const dateKey = toDateKey(navRow.date);
      const expectedUnits = getUnitsAtOrBefore(leafId, dateKey);
      const storedUnits = finiteNumber({
        value: navRow.units ?? 0,
        fieldName: "units",
        context: `leaf NAV ${idString(navRow._id)}`,
      });

      if (!nearlyEqual(expectedUnits, storedUnits, tolerance)) {
        leafUnitMismatches.push({
          navId: idString(navRow._id),
          groupId: leafId,
          date: dateKey,
          storedUnits,
          expectedUnits,
          difference: storedUnits - expectedUnits,
        });
      }
    }
  }

  const repairs = [];
  const groupSummary = [];

  for (const parentId of hierarchy.parentIds) {
    const descendantLeaves =
      hierarchy.descendantLeavesByGroup.get(parentId) || [];
    const parentRows = [...(navRowsByGroup.get(parentId) || [])].sort(
      (first, second) => asDate(first.date) - asDate(second.date),
    );
    let changedRows = 0;
    let firstChangedDate = null;
    let maximumNavDifference = 0;

    for (const navRow of parentRows) {
      const dateKey = toDateKey(navRow.date);
      const expectedValue = descendantLeaves.reduce((total, leafId) => {
        const leafRow = navByGroupAndDay.get(`${leafId}|${dateKey}`);
        return total + Number(leafRow?.value ?? 0);
      }, 0);
      const expectedUnits = getUnitsAtOrBefore(parentId, dateKey);
      let expectedNav = 100;

      if (expectedUnits > tolerance) {
        expectedNav = expectedValue / expectedUnits;
      } else if (Math.abs(expectedValue) > tolerance) {
        throw new Error(
          `Parent ${parentId} has value ${expectedValue} but zero reconstructed ` +
            `units on ${dateKey}`,
        );
      }

      if (!Number.isFinite(expectedNav) || expectedNav < 0) {
        throw new Error(
          `Invalid reconstructed NAV ${expectedNav} for ${parentId} on ${dateKey}`,
        );
      }

      const storedNav = Number(navRow.nav ?? 100);
      const storedUnits = Number(navRow.units ?? 0);
      const storedValue = Number(navRow.value ?? 0);
      const changed =
        !nearlyEqual(storedNav, expectedNav, tolerance) ||
        !nearlyEqual(storedUnits, expectedUnits, tolerance) ||
        !nearlyEqual(storedValue, expectedValue, tolerance);

      if (changed) {
        changedRows += 1;
        firstChangedDate = firstChangedDate || dateKey;
        maximumNavDifference = Math.max(
          maximumNavDifference,
          Math.abs(storedNav - expectedNav),
        );
      }

      repairs.push({
        navId: navRow._id,
        navIdString: idString(navRow._id),
        groupId: parentId,
        groupName: hierarchy.groupMap.get(parentId)?.name || parentId,
        date: asDate(navRow.date),
        dateKey,
        changed,
        old: {
          nav: storedNav,
          units: storedUnits,
          value: storedValue,
        },
        corrected: {
          nav: expectedNav,
          units: expectedUnits,
          value: expectedValue,
        },
      });
    }

    groupSummary.push({
      groupId: parentId,
      groupName: hierarchy.groupMap.get(parentId)?.name || parentId,
      totalRows: parentRows.length,
      changedRows,
      firstChangedDate,
      maximumNavDifference,
      latest:
        repairs
          .filter((repair) => repair.groupId === parentId)
          .sort((first, second) => first.date - second.date)
          .at(-1) || null,
    });
  }

  return {
    repairs,
    changedRepairs: repairs.filter((repair) => repair.changed),
    leafUnitMismatches,
    groupSummary,
  };
};

const parseArguments = (argv) => {
  const options = {
    apply: false,
    restore: null,
    userId: process.env.USER_ID || null,
    sample: 20,
    tolerance: DEFAULT_TOLERANCE,
  };

  for (const argument of argv) {
    if (argument === "--apply") {
      options.apply = true;
    } else if (argument.startsWith("--user=")) {
      options.userId = argument.slice("--user=".length);
    } else if (argument.startsWith("--restore=")) {
      options.restore = argument.slice("--restore=".length);
    } else if (argument.startsWith("--sample=")) {
      options.sample = Number(argument.slice("--sample=".length));
    } else if (argument.startsWith("--tolerance=")) {
      options.tolerance = Number(argument.slice("--tolerance=".length));
    } else if (argument === "--help" || argument === "-h") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  if (!Number.isInteger(options.sample) || options.sample < 0) {
    throw new Error("--sample must be a non-negative integer");
  }

  if (!Number.isFinite(options.tolerance) || options.tolerance <= 0) {
    throw new Error("--tolerance must be a positive number");
  }

  if (options.apply && options.restore) {
    throw new Error("Use either --apply or --restore, not both");
  }

  return options;
};

const printHelp = () => {
  console.log(`
Repair parent NAV history

Required environment:
  DB_URL, MONGO_URI, or MONGODB_URI

Required argument:
  --user=<MongoDB user ObjectId>

Modes:
  no flag                         Dry-run only
  --apply                         Back up and apply corrections
  --restore=<backup collection>   Restore a previous backup

Optional:
  --sample=20
  --tolerance=0.000001
`);
};

const makeBackupCollectionName = (navCollectionName) => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, "");
  return `${navCollectionName}_parent_nav_backup_${timestamp}`;
};

const writeInBatches = async ({ rows, buildOperation, collection }) => {
  let changed = 0;

  for (let index = 0; index < rows.length; index += BULK_SIZE) {
    const batch = rows.slice(index, index + BULK_SIZE);
    const operations = batch.map(buildOperation);
    if (operations.length === 0) continue;

    const result = await collection.bulkWrite(operations, {
      ordered: true,
    });

    changed +=
      Number(result.modifiedCount || 0) + Number(result.upsertedCount || 0);
  }

  return changed;
};

const restoreBackup = async ({
  database,
  userObjectId,
  backupCollectionName,
  collections,
}) => {
  const expectedPrefix = `${collections.nav}_parent_nav_backup_`;

  if (
    !backupCollectionName.startsWith(expectedPrefix) ||
    !/^[A-Za-z0-9_.-]+$/.test(backupCollectionName)
  ) {
    throw new Error(
      `Refusing unexpected backup collection name: ${backupCollectionName}`,
    );
  }

  const backupCollection = database.collection(backupCollectionName);
  const backupDocuments = await backupCollection
    .find({ userId: userObjectId })
    .toArray();

  if (backupDocuments.length === 0) {
    throw new Error(
      `No backup documents found for user in ${backupCollectionName}`,
    );
  }

  const restored = await writeInBatches({
    rows: backupDocuments,
    collection: database.collection(collections.nav),
    buildOperation: (document) => ({
      replaceOne: {
        filter: { _id: document._id, userId: userObjectId },
        replacement: document,
        upsert: true,
      },
    }),
  });

  console.log(
    JSON.stringify(
      {
        mode: "restore",
        backupCollection: backupCollectionName,
        backupDocuments: backupDocuments.length,
        restoredDocuments: restored,
      },
      null,
      2,
    ),
  );
};

const loadUserData = async ({ database, userObjectId, collections }) => {
  const groups = await database
    .collection(collections.groups)
    .find({ userId: userObjectId, isDeleted: { $ne: true } })
    .toArray();

  if (groups.length === 0) {
    throw new Error("No portfolio groups found for user");
  }

  const groupIds = groups.map((group) => group._id);

  const [navRows, groupStatements, ledgerStatements, financialAssets] =
    await Promise.all([
      database
        .collection(collections.nav)
        .find({ userId: userObjectId, portfolioGroupId: { $in: groupIds } })
        .sort({ date: 1 })
        .toArray(),
      database
        .collection(collections.groupStatements)
        .find({ userId: userObjectId, portfolioGroupId: { $in: groupIds } })
        .sort({ date: 1 })
        .toArray(),
      database
        .collection(collections.ledgerStatements)
        .find({ userId: userObjectId, portfolioGroupId: { $in: groupIds } })
        .sort({ date: 1 })
        .toArray(),
      database
        .collection(collections.financialAssets)
        .find({ userId: userObjectId, portfolioGroupId: { $in: groupIds } })
        .toArray(),
    ]);

  if (navRows.length === 0) {
    throw new Error("No NAV rows found for user");
  }

  const metadataIds = [
    ...new Map(
      financialAssets.map((asset) => [
        idString(asset.assetMetadataId),
        asset.assetMetadataId,
      ]),
    ).values(),
  ];
  const maximumNavDate = navRows.reduce(
    (maximum, row) =>
      !maximum || asDate(row.date) > maximum ? asDate(row.date) : maximum,
    null,
  );
  const priceRows =
    metadataIds.length === 0
      ? []
      : await database
          .collection(collections.priceHistory)
          .find({
            assetId: { $in: metadataIds },
            date: { $lte: maximumNavDate },
          })
          .sort({ assetId: 1, date: 1 })
          .toArray();

  return {
    groups,
    navRows,
    groupStatements,
    ledgerStatements,
    financialAssets,
    priceRows,
  };
};

const run = async () => {
  try {
    require("dotenv").config();
  } catch (_error) {
    // dotenv is optional. Environment variables may be supplied directly.
  }

  const options = parseArguments(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  if (!options.userId) {
    throw new Error("--user=<USER_ID> is required");
  }

  const mongoUri =
    process.env.DB_URL || process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("DB_URL, MONGO_URI, or MONGODB_URI is required");
  }

  const mongoose = require("mongoose");

  if (!mongoose.isValidObjectId(options.userId)) {
    throw new Error(`Invalid user ObjectId: ${options.userId}`);
  }

  await mongoose.connect(mongoUri);

  try {
    const database = mongoose.connection.db;
    const userObjectId = new mongoose.Types.ObjectId(options.userId);
    const collections = getCollectionNames();

    if (options.restore) {
      await restoreBackup({
        database,
        userObjectId,
        backupCollectionName: options.restore,
        collections,
      });
      return;
    }

    const input = await loadUserData({
      database,
      userObjectId,
      collections,
    });
    const replay = replayIndependentUnits({
      groups: input.groups,
      groupStatements: input.groupStatements,
      ledgerStatements: input.ledgerStatements,
      financialAssets: input.financialAssets,
      priceRows: input.priceRows,
      tolerance: options.tolerance,
    });
    const repairPlan = buildParentRepairs({
      navRows: input.navRows,
      replay,
      tolerance: options.tolerance,
    });

    if (repairPlan.leafUnitMismatches.length > 0) {
      console.error(
        JSON.stringify(
          {
            error: "Leaf-unit validation failed. No parent NAV may be changed.",
            mismatchCount: repairPlan.leafUnitMismatches.length,
            sample: repairPlan.leafUnitMismatches.slice(0, options.sample),
          },
          null,
          2,
        ),
      );
      throw new Error(
        "The transaction replay does not reproduce existing leaf units",
      );
    }

    const summary = {
      mode: options.apply ? "apply" : "dry-run",
      userId: options.userId,
      counts: {
        groups: input.groups.length,
        leafGroups: replay.hierarchy.leafIds.size,
        parentGroups: replay.hierarchy.parentIds.size,
        groupStatements: input.groupStatements.length,
        ledgerStatements: input.ledgerStatements.length,
        priceRows: input.priceRows.length,
        navRows: input.navRows.length,
        replayedEvents: replay.eventCount,
        parentRowsChecked: repairPlan.repairs.length,
        parentRowsToChange: repairPlan.changedRepairs.length,
        leafUnitMismatches: repairPlan.leafUnitMismatches.length,
      },
      groupSummary: repairPlan.groupSummary.map((group) => ({
        groupId: group.groupId,
        groupName: group.groupName,
        totalRows: group.totalRows,
        changedRows: group.changedRows,
        firstChangedDate: group.firstChangedDate,
        maximumNavDifference: roundForLog(group.maximumNavDifference),
        latest: group.latest
          ? {
              date: group.latest.dateKey,
              oldNav: roundForLog(group.latest.old.nav),
              correctedNav: roundForLog(group.latest.corrected.nav),
              oldUnits: roundForLog(group.latest.old.units),
              correctedUnits: roundForLog(group.latest.corrected.units),
              value: roundForLog(group.latest.corrected.value),
            }
          : null,
      })),
      sampleChanges: repairPlan.changedRepairs
        .slice(0, options.sample)
        .map((repair) => ({
          navId: repair.navIdString,
          groupName: repair.groupName,
          date: repair.dateKey,
          oldNav: roundForLog(repair.old.nav),
          correctedNav: roundForLog(repair.corrected.nav),
          oldUnits: roundForLog(repair.old.units),
          correctedUnits: roundForLog(repair.corrected.units),
          value: roundForLog(repair.corrected.value),
        })),
    };

    if (!options.apply) {
      console.log(JSON.stringify(summary, null, 2));
      console.log(
        "Dry-run complete. Run again with --apply only after reviewing this output.",
      );
      return;
    }

    const parentDocuments = input.navRows.filter((row) =>
      replay.hierarchy.parentIds.has(idString(row.portfolioGroupId)),
    );
    const backupCollectionName = makeBackupCollectionName(
      collections.nav,
    );
    const backupCollection = database.collection(backupCollectionName);

    if (parentDocuments.length > 0) {
      await backupCollection.insertMany(parentDocuments, { ordered: true });
    }

    console.log(
      `Backup created: ${backupCollectionName} ` +
        `(${parentDocuments.length} parent NAV documents)`,
    );

    const updatedDocuments = await writeInBatches({
      rows: repairPlan.changedRepairs,
      collection: database.collection(collections.nav),
      buildOperation: (repair) => ({
        updateOne: {
          filter: {
            _id: repair.navId,
            userId: userObjectId,
          },
          update: {
            $set: {
              nav: repair.corrected.nav,
              units: repair.corrected.units,
              value: repair.corrected.value,
              updatedAt: new Date(),
            },
          },
          upsert: false,
        },
      }),
    });

    const postWriteNavRows = await database
      .collection(collections.nav)
      .find({
        userId: userObjectId,
        portfolioGroupId: { $in: input.groups.map((group) => group._id) },
      })
      .sort({ date: 1 })
      .toArray();
    const verification = buildParentRepairs({
      navRows: postWriteNavRows,
      replay,
      tolerance: options.tolerance,
    });

    if (
      verification.leafUnitMismatches.length > 0 ||
      verification.changedRepairs.length > 0
    ) {
      throw new Error(
        `Post-write verification failed. Restore from ${backupCollectionName}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          ...summary,
          backupCollection: backupCollectionName,
          backupDocuments: parentDocuments.length,
          updatedDocuments,
          postWriteVerification: "passed",
        },
        null,
        2,
      ),
    );
  } finally {
    await mongoose.disconnect();
  }
};

module.exports = {
  asDate,
  buildHierarchy,
  buildParentRepairs,
  createPriceLookup,
  getNAVCutoff,
  idString,
  replayIndependentUnits,
  toDateKey,
};

if (require.main === module) {
  run().catch((error) => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  });
}
