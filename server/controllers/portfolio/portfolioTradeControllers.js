const mongoose = require("mongoose");
const {
  upsertNavPerformance,
} = require("../../services/syncPortfolio/updateGroup_NAV");
const {
  syncPortfolio,
} = require("../../services/syncPortfolio/updatePortfolio");
const {
  getPortfolioGroupCurrentValues,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/getConsolidatedCurrentValue");
const { tradeTransaction } = require("./tradeActions/trade");

// =====================================================
// 🔴 CONTROLLER
// =====================================================
module.exports.trade = async (req, res) => {
  let transactionResult;
  try {
    // 🔴 1. Trade (has its own session)
    transactionResult = await tradeTransaction(req, res);

    if (!transactionResult.success) {
      return res.status(400).json({
        message: "Transaction Failed",
        error: transactionResult.message,
      });
    }

    // 🔴 2. Sync (has its own session)
    const { success } = await syncPortfolio(req.user.id);

    if (!success) {
      return res.status(400).json({
        error: transactionResult.message,
        message:
          "Transaction Successful but syncPortfolio Failed. Portfolio will sync later.",
      });
    }

    // 🔴 3. NAV update (separate transaction)
    const session = await mongoose.startSession();
    let portfolioGroups = [];
    await session.withTransaction(async () => {
      portfolioGroups = await getPortfolioGroupCurrentValues(
        req.user.id,
        session,
      );
      const bulkOps = portfolioGroups.map(
        ({ portfolioGroupId, consolidatedCurrentValue }) =>
          upsertNavPerformance({
            session,
            portfolioGroupId,
            userId: req.user.id,
            date: transactionResult.date,
            type: "market",
            amount: Number(consolidatedCurrentValue),
          }),
      );
      await Promise.all(bulkOps);
    });
    session.endSession();
    return res.status(200).json({
      success: true,
      message: "Trade, Sync & NAV Update Completed Successfully",
      portfolioGroups,
    });
  } catch (error) {
    console.log(error)
    return res.status(400).json({
      error: error.message,
    });
  }
};
