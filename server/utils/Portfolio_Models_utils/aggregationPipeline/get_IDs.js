const mongoose = require("mongoose");

module.exports.getAllGroupIdsByUser = async ({ userId, session = null }) => {
  const PortfolioGroup_Model = mongoose.model("portfolioGroup");
  const groups = await PortfolioGroup_Model.find({ userId })
    .select("_id")
    .session(session)
    .lean();
  return groups.map((g) => g._id);
};
