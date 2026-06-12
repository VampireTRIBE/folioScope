const mongoose = require("mongoose");
const { tradeTransaction } = require("./tradeActions/trade");
const {
  sync_FillFutureNAVs,
  sync_Portfolio,
} = require("../../sync_Scripts/sync_Portfolio/sync_Portfolio");

// =====================================================
// 🔴 CONTROLLER
// =====================================================
module.exports.trade = async (req, res) => {
  let transactionResult;
  try {
    // 🔴 1. Past nav fill + Trade (has its own session)
    transactionResult = await tradeTransaction(req, res);

    if (!transactionResult.success) {
      return res.status(400).json({
        message: "Transaction Failed",
        error: transactionResult.message,
      });
    }

    // 🔴 1. Future Nav Fill upto current Date
    const { date } = req.body;
    const { success } = await sync_FillFutureNAVs(req.userId, date);
    if (!success) {
      return res.status(400).json({
        error: true,
        message:
          "Transaction Successful but NavSync Failed. It will sync later.",
      });
    }

    // 🔴 1. group syncPortfolio only currnet Snapshot
    const syncPortfolioResult = await sync_Portfolio(req.userId);

    if (!syncPortfolioResult.success) {
      return res.status(400).json({
        error: transactionResult.message,
        message:
          "Transaction Successful but syncPortfolio Failed. Portfolio will sync later.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Trade, Sync & NAV Update Completed Successfully",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
