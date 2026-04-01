const mongoose = require("mongoose");
const PortfolioGroupModel = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const PortfolioGroupStatementModel = require("../../models/Portfolio_Models/ledger_Models/groupStatement");
const FinantialAssetModel = require("../../models/Portfolio_Models/PortfolioMetrix_Models/finantialAsset");
const {
  is_Leaf,
} = require("../../utils/Portfolio_Models_utils/aggregationPipeline/IsLeaf");

module.exports.tradeTransaction = async (req, res) => {
  //   const session = await mongoose.startSession();
  try {
    const u_id = req.user._id;
    const { pg_id, a_id } = req.params;
    const { type, date, qty, price, dividendAmount } = req.body;

    if (type === "buy" || type === "sell") {
      // const { userId, isLeaf, path, consolidatedCash } = await is_Leaf(
      const result = await is_Leaf(PortfolioGroupModel, pg_id);
      const financialAssetDoc = await FinantialAssetModel.findOne({
        assetMetadataId: a_id,
        portfolioGroupId: pg_id,
      })
        .select("totalQty buyAVG dateAdded userId portfolioGroupId")
        .lean();

      if (!result.isLeaf) {
        throw new Error("only on leaf nodes");
      }
      if (result.userId.toString() !== u_id.toString()) {
        throw new Error("Unauthorized");
      }
      if (type === "buy" && result.consolidatedCash < qty * price) {
        throw new Error("Insufficient Funds");
      }

      return res.status(201).json({
        success: "Transaction completed successfully",
        data: financialAssetDoc,
        is_Leaf: result,
      });
    }
    return res.status(201).json({
      success: "not Sell",
    });

    //  await session.withTransaction(async () => {
    //    const { userId, isLeaf, path, consolidatedCash } = await is_Leaf(
    //      PortfolioGroupModel,
    //      pg_id,
    //      session,
    //    );

    //    if (!isLeaf) {
    //      throw new Error("Allowed only on leaf nodes");
    //    }

    //    if (userId.toString() !== u_id.toString()) {
    //      throw new Error("Unauthorized");
    //    }

    //    if (type === "withdrawal" && consolidatedCash < amount) {
    //      throw new Error("Insufficient Funds");
    //    }

    //    await PortfolioGroupStatementModel.create(
    //      [
    //        {
    //          portfolioGroupId: pg_id,
    //          userId: u_id,
    //          date,
    //          type,
    //          amount,
    //        },
    //      ],
    //      { session },
    //    );

    //    const signedAmount = type === "withdrawal" ? -amount : amount;
    //    await PortfolioGroupModel.updateMany(
    //      { _id: { $in: [...path, pg_id] } },
    //      { $inc: { consolidatedCash: signedAmount } },
    //      { session },
    //    );
    //  });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
  //    finally {
  //     session.endSession();
  //   }
};
