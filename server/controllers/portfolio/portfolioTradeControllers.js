const { tradeTransaction } = require("./tradeActions/trade");
const { updatePortfolioSnapshot } = require("./tradeActions/updatePortfolioSnapshots");
const {
  updateFinancialAssetSnapshot,
} = require("./tradeActions/updateSnapshots");

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

    const updateFinancialAssetSnapshotResult =
      await updateFinancialAssetSnapshot(req, res);
    if (!updateFinancialAssetSnapshotResult) {
      return res.status(400).json({
        message: "Financial Asset Update Failed",
        error: transactionResult.message,
      });
    }

    const updatePortfolioSnapshotResult =
      await updatePortfolioSnapshot(req, res);
    if (!updatePortfolioSnapshotResult) {
      return res.status(400).json({
        message: "Financial Asset Update Failed",
        error: transactionResult.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Trade Completed Successfully",
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
