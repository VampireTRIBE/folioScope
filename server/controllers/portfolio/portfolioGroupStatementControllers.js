const mongoose = require("mongoose");
const PortfolioGroupModel = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const PortfolioGroupStatementModel = require("../../models/Portfolio_Models/ledger_Models/groupStatement");
const LedgerStatementModel = require("../../models/Portfolio_Models/ledger_Models/ledgerStatement");

const { is_Leaf } = require("../../utils/mongodb/aggregations/check_Leaf");
const {
  update_GroupNAV,
} = require("../../sync_Scripts/sync_Portfolio/update_GroupNAV");
const {
  fill_MissingNAVs,
} = require("../../sync_Scripts/sync_Portfolio/fill_MissingNavs");
const {
  sync_FillFutureNAVs,
} = require("../../sync_Scripts/sync_Portfolio/sync_Portfolio");

// =====================================
// LOCK CONFIG
// =====================================
const LOCK_TIMEOUT = 1000 * 60; // 1 minute

// =====================================
// GROUP LOCK HELPERS
// =====================================
const acquireGroupLock = async (groupId, session) => {
  const now = new Date();
  const locked = await PortfolioGroupModel.findOneAndUpdate(
    {
      _id: groupId,
      $or: [
        { "lock.isLocked": false },
        { "lock.isLocked": { $exists: false } },
        { "lock.lockedAt": { $lt: new Date(now - LOCK_TIMEOUT) } },
      ],
    },
    {
      $set: {
        "lock.isLocked": true,
        "lock.lockedAt": now,
      },
    },
    { new: true, session },
  );

  if (!locked) {
    throw new Error("Another group transaction is in progress");
  }

  return locked;
};

const releaseGroupLock = async (groupId) => {
  await PortfolioGroupModel.updateOne(
    { _id: groupId },
    {
      $set: {
        "lock.isLocked": false,
      },
    },
  );
};

// =====================================
// CONTROLLER
// =====================================
module.exports.groupstatementTransaction = async (req, res) => {
  const session = await mongoose.startSession();
  let lockedGroupId = null;

  try {
    const u_id = req.user._id;
    const { pg_id } = req.params;
    let { type, date, amount } = req.body;
    let result = null;

    await session.withTransaction(async () => {
      // ---------------- LOCK FIRST ----------------
      await acquireGroupLock(pg_id, session);
      lockedGroupId = pg_id;

      // ---------------- VALIDATION ----------------
      const [cheak_Leaf, groupLastStatement, tradeLastStatement] =
        await Promise.all([
          is_Leaf(PortfolioGroupModel, pg_id),
          PortfolioGroupStatementModel.findOne({
            userId: u_id,
          }).sort({ date: -1 }),
          LedgerStatementModel.findOne({
            userId: u_id,
          }).sort({ date: -1 }),
        ]);

      const { userId, isLeaf, path, consolidatedCash } = cheak_Leaf;

      if (!isLeaf) {
        throw new Error("Allowed only on leaf nodes");
      }

      if (path.length <= 0) {
        throw new Error("Transaction not allowed in Default Group");
      }

      if (userId.toString() !== u_id.toString()) {
        throw new Error("Unauthorized");
      }

      if (type === "withdrawal" && consolidatedCash < amount) {
        throw new Error("Insufficient Funds");
      }

      if (type === "tax" && consolidatedCash < amount) {
        throw new Error("Insufficient Funds For Paying Tax");
      }

      // ---------------- LAST TX CHECK ----------------

      if (
        groupLastStatement &&
        new Date(date) <= new Date(groupLastStatement.date)
      ) {
        throw new Error("Backdated or same timestamp transaction not allowed");
      }

      if (
        tradeLastStatement &&
        new Date(date) <= new Date(tradeLastStatement.date)
      ) {
        throw new Error("Backdated or same timestamp transaction not allowed");
      }

      // ---------------- FILL NAV GAP ----------------
      let startDate = null;

      const groupDate = groupLastStatement
        ? new Date(groupLastStatement.date)
        : null;

      const tradeDate = tradeLastStatement
        ? new Date(tradeLastStatement.date)
        : null;

      if (groupDate && tradeDate) {
        startDate = groupDate > tradeDate ? groupDate : tradeDate;
      } else if (groupDate) {
        startDate = groupDate;
      } else if (tradeDate) {
        startDate = tradeDate;
      }

      if (startDate) {
        result = await fill_MissingNAVs(
          u_id,
          session,
          startDate,
          new Date(date),
        );
      } else {
        result = await fill_MissingNAVs(
          u_id,
          session,
          new Date(date),
          new Date(date),
        );
      }

      // ---------------- LEDGER ENTRY ----------------
      await PortfolioGroupStatementModel.create(
        [
          {
            portfolioGroupId: pg_id,
            userId: u_id,
            date,
            type,
            amount,
          },
        ],
        { session },
      );

      // ---------------- CASH UPDATE ----------------
      const signedAmount =
        type === "withdrawal" || type === "tax" ? -amount : amount;

      await PortfolioGroupModel.updateMany(
        { _id: { $in: [...path, pg_id] } },
        {
          $inc:
            type === "tax"
              ? {
                  consolidatedCash: signedAmount,
                  consolidatedTax: amount,
                  consolidatedCurrentValue: signedAmount,
                }
              : {
                  consolidatedCash: signedAmount,
                  consolidatedCurrentValue: signedAmount,
                },
        },
        { session },
      );

      // ---------------- NAV UPDATE ----------------
      const groupAffectedIds = [...path, pg_id];

      await Promise.all(
        groupAffectedIds.map((id) =>
          update_GroupNAV({
            session,
            portfolioGroupId: id,
            userId: u_id,
            date,
            type,
            amount: Number(amount),
          }),
        ),
      );
    });

    if (lockedGroupId) {
      await releaseGroupLock(lockedGroupId);
    }

    const { success } = await sync_FillFutureNAVs(u_id, date);

    return res.status(201).json({
      success: "Transaction completed successfully",
      result,
    });
  } catch (error) {
    if (lockedGroupId) {
      await releaseGroupLock(lockedGroupId);
    }

    return res.status(400).json({
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};
