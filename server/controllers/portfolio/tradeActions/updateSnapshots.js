const mongoose = require("mongoose");
const {
  updatefinancialSnapshotsBulk,
} = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/updateFinancialSnapshots");

// =====================================================
// 🔴 Financial Asset Update Snapshot
// =====================================================
module.exports.updateFinancialAssetSnapshot = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    await updatefinancialSnapshotsBulk(req.user._id, null, session);
    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Financial Assets updated..." };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { success: false, message: error.message };
  }
};
