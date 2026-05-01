const mongoose = require("mongoose");
const customError = require("../../utils/shared/error/customError");
const log = require("../../utils/shared/console_Loggers/consoleLoggers");

module.exports.clearDatabase = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    log.running("CLEARING DATABASE START");

    const userModel = mongoose.model("users");
    const NAVModel = mongoose.model("navPerformence");
    const financialAssetModel = mongoose.model("financialAsset");
    const groupModel = mongoose.model("portfolioGroup");
    const ledgerModel = mongoose.model("ledgerStatement");
    const groupLedgerModel = mongoose.model("groupStatement");
    const fifoLotModel = mongoose.model("fifoLot");

    await Promise.all([
      userModel.deleteMany({ role: "client" }, { session }),
      NAVModel.deleteMany({}, { session }),
      financialAssetModel.deleteMany({}, { session }),
      groupModel.deleteMany({}, { session }),
      ledgerModel.deleteMany({}, { session }),
      groupLedgerModel.deleteMany({}, { session }),
      fifoLotModel.deleteMany({}, { session }),
    ]);
    await session.commitTransaction();
    log.success("CLEARING DATABASE END");
    res.status(200).json({ success: "Clearing Database SuccessFull" });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
};

module.exports.getGroup = async (req, res, next) => {
  const groupModel = mongoose.model("portfolioGroup");
  const u_id = req.user.id;
  const { g_id } = req.params;
  const groupDoc = await groupModel.findById(g_id);
  res.status(200).json({ success: true, groupDoc });
};
