// ! Models

const PORTFOLIOGROUP_MODEL = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const FINANCIALASSET_MODEL = require("../../models/Portfolio_Models/PortfolioMetrics_Models/financialAsset");
const PORTFOLIOREBALANCER_MODEL = require("../../models/Portfolio_Models/PortfolioMetrics_Models/portfolioRebalancer");
const {
  get_leafGroupIDsByGroup,
} = require("../../utils/mongodb/aggregations/get_leafGroupIDsByGroup");

// ! utils
const {
  find_validate_user,
} = require("../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const {
  read_User_Holdings,
} = require("../../utils/mongodb/aggregations/readModels/read_FinancialAsset_Models/read_User_Holdings");
const {
  find_validate_portfolioGroup,
} = require("../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroup_Metadata");
const {
  read_NetWorthRange1D,
} = require("../../utils/mongodb/aggregations/readModels/readpriceRange/priceRange");
const {
  validate_NewRebalancer_ReqData,
} = require("../../utils/mongodb/aggregations/writeModels/write_Rebalancer_Model/validate_NewRebalancer");
const customError = require("../../utils/shared/error/customError");

module.exports.get_GroupMetadata = async (req, res) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;
    const { pg_id } = req.params;

    const protfolioGroupFilterObj = { _id: pg_id, userId: userID };

    const portfolioGroup = await find_validate_portfolioGroup({
      filterObj: protfolioGroupFilterObj,
    });

    const netWorth = await read_NetWorthRange1D(pg_id, userID);

    const respData = {
      _id: portfolioGroup._id,
      groupName: portfolioGroup.name,
      description: portfolioGroup.description,
      level: portfolioGroup.level,
      consolidatedSnapshot: {
        netcurrentvalue: portfolioGroup.consolidatedCurrentValue,
        consolidatedcash: portfolioGroup.consolidatedCash,
        consolidatedtax: portfolioGroup.consolidatedTax,
      },
      currentInvestment: {
        investmentvalue: portfolioGroup.groupSnapshot.investmentValue,
        currentvalue: portfolioGroup.groupSnapshot.currentValue,
        pl: (
          Number(portfolioGroup.groupSnapshot.currentValue) -
          Number(portfolioGroup.groupSnapshot.investmentValue)
        ).toFixed(2),
        "pl%": (
          (Number(portfolioGroup.groupSnapshot.currentValue) -
            Number(portfolioGroup.groupSnapshot.investmentValue)) /
          Number(portfolioGroup.groupSnapshot.investmentValue)
        ).toFixed(2),
      },
      networth: netWorth,
      currentyear: {
        realizedgain: portfolioGroup.groupSnapshot.financialYear.realizedGain,
        dividend: portfolioGroup.groupSnapshot.financialYear.dividend,
        unrealizedgain:
          portfolioGroup.groupSnapshot.financialYear.unrealizedGain,
        totalgain: portfolioGroup.groupSnapshot.financialYear.totalGain,
      },
      lifetime: {
        realized: portfolioGroup.groupSnapshot.lifetime.realizedGain,
        dividend: portfolioGroup.groupSnapshot.lifetime.dividend,
        totalgain: (
          Number(portfolioGroup.groupSnapshot.lifetime.realizedGain) +
          Number(portfolioGroup.groupSnapshot.lifetime.dividend)
        ).toFixed(2),
      },
    };

    return res.status(200).json({
      success: true,
      message: "Metadata Fetched",
      data: respData,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate group name" });
    }
    return res.status(500).json({ error: error.message });
  }
};

module.exports.fetch_UserHoldings = async (req, res, next) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;
    const { groupId } = req.body;

    const financialAssetFilterObj = {
      portfolioGroupId: groupId,
      userId: userID,
      status: true,
    };

    const userHoldingData = await read_User_Holdings({
      filterObj: financialAssetFilterObj,
    });

    return res.status(200).json({
      success: true,
      message: "Metadata Fetched",
      data: userHoldingData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.createRebalancer = async (req, res, next) => {
  try {
    const userID = req.userId;
    req.body.userId = userID;

    const validated_Data = await validate_NewRebalancer_ReqData(req.body);
    const createdRebalancer =
      await PORTFOLIOREBALANCER_MODEL.create(validated_Data);

    return res.status(201).json({
      success: true,
      message: "Rebalancer Created",
      data: createdRebalancer,
    });
  } catch (error) {
    if (error.code === 11000) {
      return next(new customError("Duplicate rebalancer", 400));
    }
    next(error);
  }
};

module.exports.fetchRebalancerList = async (req, res, next) => {
  try {
    const userID = req.userId;

    const rebalancers = await PORTFOLIOREBALANCER_MODEL.find({
      userId: userID,
    })
      .select(
        "rebalancerName rebalancerDescription portfolioGroupId assets marketFallRules isActive createdAt updatedAt",
      )
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Rebalancers Fetched",
      data: rebalancers,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.fetchRebalancerById = async (req, res, next) => {
  try {
    const userID = req.userId;
    const { rebalancerId } = req.params;

    const rebalancer = await PORTFOLIOREBALANCER_MODEL.findOne({
      _id: rebalancerId,
      userId: userID,
    }).lean();

    if (!rebalancer) {
      throw new customError("Rebalancer not found", 404);
    }

    return res.status(200).json({
      success: true,
      message: "Rebalancer Fetched",
      data: rebalancer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.addGroup = async (req, res, next) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;
    const { pg_id } = req.params;

    if (!req.body || !req.body.name || !req.body.description) {
      throw new customError("Invalid payload", 400);
    }

    const { name, description } = req.body;
    if (!name.trim()) {
      throw new customError("Name is required", 400);
    }

    const [parent, financialAsset] = await Promise.all([
      PORTFOLIOGROUP_MODEL.findById(pg_id).select("level path userId").lean(),
      FINANCIALASSET_MODEL.findOne({
        portfolioGroupId: pg_id,
        userId: userID,
      }).lean(),
    ]);

    if (financialAsset) {
      throw new customError("Group with asset cannot become parent", 400);
    }

    if (!parent) {
      throw new customError("Invalid Group ID", 400);
    }

    if (parent.userId.toString() !== userID.toString()) {
      throw new customError("Unauthorized", 403);
    }

    if (parent.level >= 4) {
      throw new customError("Max depth reached", 400);
    }

    const doc = new PORTFOLIOGROUP_MODEL({
      name: name.trim(),
      description,
      parentId: pg_id,
      userId: userID,
    });
    doc.$locals.parent = parent;
    await doc.save();
    return res.status(201).json({
      success: true,
      message: "Group Created",
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new customError("Duplicate group name", 400);
    }
    next(error);
  }
};

module.exports.updateGroup = async (req, res) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;
    const { pg_id } = req.params;

    if (!req.body || !req.body.name || !req.body.description) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const cleanName = req.body.name.trim();
    const { description } = req.body;

    if (!cleanName) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedDoc = await PORTFOLIOGROUP_MODEL.findOneAndUpdate(
      { _id: pg_id, userId: userID },
      { $set: { name: cleanName, description } },
      { new: true, runValidators: true },
    );

    if (!updatedDoc) {
      return res.status(404).json({
        error: "Group not found or unauthorized",
      });
    }

    return res.status(200).json({
      success: "Group updated",
      data: updatedDoc,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate group name" });
    }
    return res.status(500).json({ error: error.message });
  }
};

module.exports.deleteGroup = async (req, res) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;
    const { pg_id } = req.params;

    const node = await PORTFOLIOGROUP_MODEL.findById(pg_id)
      .select("level userId path")
      .lean();

    if (!node) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (node.userId.toString() !== userID.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (node.level === 1) {
      return res.status(400).json({
        error: "Root cannot be deleted",
      });
    }

    await PORTFOLIOGROUP_MODEL.updateMany(
      {
        $or: [{ _id: pg_id }, { path: pg_id }],
      },
      {
        $set: { isDeleted: true },
      },
    );

    return res.status(200).json({
      success: "Group deleted",
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
