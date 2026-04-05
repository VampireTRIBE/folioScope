const {
  syncPortfolio,
} = require("../../services/syncPortfolio/updatePortfolio");
const { tradeTransaction } = require("./tradeActions/trade");

// =====================================================
// 🔴 CONTROLLER
// =====================================================
module.exports.trade = async (req, res) => {
  try {
    const transactionResult = await tradeTransaction(req, res);
    if (!transactionResult.success) {
      return res.status(400).json({
        message: "Transaction Failed",
        error: transactionResult.message,
      });
    }

    const { success } = await syncPortfolio(req.user.id);
    if (!success && transactionResult.success) {
      return res.status(400).json({
        error: transactionResult.message,
        message: "Transaction Successfull but syncPortfolio Failed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trade & Sync Portfolio Completed Successfully",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
