const mongoose = require("mongoose");
const { updatePortfolioGroupTree } = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/updatePortfolioGroupSnapshot");
const { getLeafNodes } = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_LeafNodes");

// =====================================================
// 🔴 Financial Asset Update Snapshot
// =====================================================
module.exports.updatePortfolioSnapshot = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    const leafGroupIds = await getLeafNodes(req.user._id);
    await updatePortfolioGroupTree(leafGroupIds,req.user._id, session);
    await session.commitTransaction();
    session.endSession();
    return { success: true, message: "Portfolio updated..." };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return { success: false, message: error.message };
  }
};
