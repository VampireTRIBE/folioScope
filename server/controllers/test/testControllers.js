const mongoose = require("mongoose");
const customError = require("../../utils/shared/error/customError");
const log = require("../../utils/shared/console_Loggers/consoleLoggers");
const {
  reverseCorporateActionPriceAdjustment,
} = require("../../utils/transformData/adjestPrice");

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
      userModel.deleteMany({}, { session }),
      NAVModel.deleteMany({}, { session }),
      financialAssetModel.deleteMany({}, { session }),
      groupModel.deleteMany({}, { session }),
      ledgerModel.deleteMany({}, { session }),
      groupLedgerModel.deleteMany({}, { session }),
      fifoLotModel.deleteMany({}, { session }),
    ]);
    await session.commitTransaction();
    log.success("CLEARING DATABASE END");
    res.status(200).json({ success: "Clearing Database Successful" });
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

module.exports.adjustFactor = async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    const { assetId, ratio, dryRun = false } = req.body;

    if (!assetId) {
      return res.status(400).json({
        success: false,
        message: "assetId is required",
      });
    }

    const numericRatio = Number(ratio);

    if (!Number.isFinite(numericRatio) || numericRatio <= 0) {
      return res.status(400).json({
        success: false,
        message: "ratio must be a valid number greater than zero",
      });
    }

    let result;

    await session.withTransaction(async () => {
      result = await reverseCorporateActionPriceAdjustment(
        assetId,
        numericRatio,
        session,
        Boolean(dryRun),
      );
    });

    return res.status(200).json({
      success: true,
      message: dryRun
        ? "Corporate action adjustment preview generated"
        : "Corporate action price adjustment reversed successfully",
      data: result,
    });
  } catch (error) {
    return next(error);
  } finally {
    await session.endSession();
  }
};
