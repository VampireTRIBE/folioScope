const PortfolioGroupModel = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");

module.exports.addGroup = async (req, res) => {
  try {
    const u_id = req.user._id;
    const { pg_id } = req.params;

    if (!req.body || !req.body.name || !req.body.description) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const { name, description } = req.body;
    if (!name.trim()) {
      return res.status(400).json({ error: "Name is required" });
    }

    const parent = await PortfolioGroupModel.findById(pg_id)
      .select("level path userId")
      .lean();
    if (!parent) {
      return res.status(404).json({ error: "Invalid Group ID" });
    }

    if (parent.userId.toString() !== u_id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (parent.level >= 4) {
      return res.status(400).json({ error: "Max depth reached" });
    }

    const doc = new PortfolioGroupModel({
      name: name.trim(),
      description,
      parentId: pg_id,
      userId: u_id,
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
    const u_id = req.user._id;
    const { pg_id } = req.params;

    if (!req.body || !req.body.name || !req.body.description) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const cleanName = req.body.name.trim();
    const { description } = req.body;

    if (!cleanName) {
      return res.status(400).json({ error: "Name is required" });
    }

    const updatedDoc = await PortfolioGroupModel.findOneAndUpdate(
      { _id: pg_id, userId: u_id },
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
    const u_id = req.user._id;
    const { pg_id } = req.params;

    const node = await PortfolioGroupModel.findById(pg_id)
      .select("level userId path")
      .lean();

    if (!node) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (node.userId.toString() !== u_id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (node.level === 1) {
      return res.status(400).json({
        error: "Root cannot be deleted",
      });
    }

    await PortfolioGroupModel.updateMany(
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
