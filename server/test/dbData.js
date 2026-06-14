const mongoose = require("mongoose");
const {
  normalizeToIST330PM,
} = require("../utils/transformData/normalizeDates");

module.exports.fetchAssetPriceHistories = async (assetid, startDate) => {
  const AssetPriceHistory = mongoose.model("AssetPriceHistory");
  startDate = normalizeToIST330PM(startDate);
  const result = await AssetPriceHistory.find({
    assetId: assetid,
    date: { $gte: startDate },
  })
    .sort({ date: 1 })
    .select("assetId date close");
  return result;
};

module.exports.userGroups = async (userId) => {
  const PortfolioGroupModel = mongoose.model("portfolioGroup");
  const result = await PortfolioGroupModel.find({ userId });
  return result;
};

module.exports.groupStatement = async (userId) => {
  const groupStatementModel = mongoose.model("groupStatement");
  const result = await groupStatementModel.find({ userId }).sort({ date: 1 });
  return result;
};

module.exports.financialAsset = async (userId) => {
  const financialAssetModel = mongoose.model("financialAsset");
  const result = await financialAssetModel.find({ userId });
  return result;
};

module.exports.ledgerStatement = async (userId) => {
  const ledgerStatementModel = mongoose.model("ledgerStatement");
  const result = await ledgerStatementModel.find({ userId }).sort({ date: 1 });
  return result;
};

module.exports.fifoLot = async (userId) => {
  const fifoLotModel = mongoose.model("fifoLot");
  const result = await fifoLotModel.find({ userId }).sort({ buyDate: 1 });
  return result;
};

module.exports.navPerformence = async (userId) => {
  const navPerformenceModel = mongoose.model("navPerformence");
  const result = await navPerformenceModel.find({ userId }).sort({ date: 1 });
  return result;
};
