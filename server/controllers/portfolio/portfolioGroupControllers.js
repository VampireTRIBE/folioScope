// ! Models

const PORTFOLIOGROUP_MODEL = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const FINANCIALASSET_MODEL = require("../../models/Portfolio_Models/PortfolioMetrics_Models/financialAsset");

// ! utils
const {
  find_validate_user,
} = require("../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const {
  find_validate_portfolioGroup,
} = require("../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroup_Metadata");

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

module.exports.addGroup = async (req, res) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;
    const { pg_id } = req.params;

    if (!req.body || !req.body.name || !req.body.description) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { name, description } = req.body;
    if (!name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const [parent, financialAsset] = await Promise.all([
      PORTFOLIOGROUP_MODEL.findById(pg_id).select("level path userId").lean(),
      FINANCIALASSET_MODEL.findOne({
        portfolioGroupId: pg_id,
        userId: userID,
      }).lean(),
    ]);

    if (financialAsset) {
      return res
        .status(400)
        .json({ error: "Group with asset cannot become parent" });
    }

    if (!parent) {
      return res.status(404).json({ error: "Invalid Group ID" });
    }

    if (parent.userId.toString() !== userID.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (parent.level >= 4) {
      return res.status(400).json({ error: "Max depth reached" });
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
      success: "Group created",
      data: doc,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: "Duplicate group name" });
    }
    return res.status(500).json({ error: error.message });
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
