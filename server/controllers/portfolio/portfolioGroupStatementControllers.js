const mongoose = require("mongoose");
const PortfolioGroupModel = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const PortfolioGroupStatementModel = require("../../models/Portfolio_Models/ledger_Models/groupStatement");

const {
  is_Leaf,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/IsLeaf");

const {
  upsertNavPerformance,
} = require("../../services/syncPortfolio/updateGroup_NAV");
const { Fill_PastNAV } = require("../../services/syncPortfolio/fill_nav_Gap");

module.exports.groupstatementTransaction = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const u_id = req.user._id;
    const { pg_id } = req.params;
    let { type, date, amount } = req.body;

    await session.withTransaction(async () => {
      // ---------------- VALIDATION ----------------
      const { userId, isLeaf, path, consolidatedCash } = await is_Leaf(
        PortfolioGroupModel,
        pg_id,
        session,
      );

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

      const groupLastStatement = await PortfolioGroupStatementModel.findOne()
        .sort({ date: -1 })
        .session(session);

      if (
        groupLastStatement &&
        new Date(date) <= new Date(groupLastStatement.date)
      ) {
        throw new Error("Backdated or same timestamp transaction not allowed");
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
                }
              : {
                  consolidatedCash: signedAmount,
                },
        },
        { session },
      );

      // ---------------- NAV UPDATE ----------------
      const groupAffectedIds = [...path, pg_id];

      await Promise.all(
        groupAffectedIds.map((id) =>
          upsertNavPerformance({
            session,
            portfolioGroupId: id,
            userId: u_id,
            date,
            type,
            amount: Number(amount),
          }),
        ),
      );
      await Fill_PastNAV(userId, session, date);
    });

    return res.status(201).json({
      success: "Transaction completed successfully",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  } finally {
    session.endSession();
  }
};
