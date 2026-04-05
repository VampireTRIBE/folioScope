const mongoose = require("mongoose");
const PortfolioGroupModel = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const PortfolioGroupStatementModel = require("../../models/Portfolio_Models/ledger_Models/groupStatement");
const {
  is_Leaf,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/IsLeaf");

module.exports.groupstatementTransaction = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const u_id = req.user._id;
    const { pg_id } = req.params;
    let { type, date, amount } = req.body;

    await session.withTransaction(async () => {
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

      const signedAmount = type === "withdrawal" ? -amount : amount;
      await PortfolioGroupModel.updateMany(
        { _id: { $in: [...path, pg_id] } },
        { $inc: { consolidatedCash: signedAmount } },
        { session },
      );
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
