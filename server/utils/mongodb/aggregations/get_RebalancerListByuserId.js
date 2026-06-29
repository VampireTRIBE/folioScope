const mongoose = require("mongoose");
const customError = require("../../shared/error/customError");

module.exports.get_RebalancerListByUserId = async (
  userId = null,
  session = null,
) => {
  try {
    if (!userId) {
      throw new customError("Missing credentials", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new customError("Invalid user id", 400);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const REBALANCER_MODEL = mongoose.model("PortfolioRebalancer");

    const query = REBALANCER_MODEL.find(
      {
        userId: userObjectId,
        isActive: false,
      },
      {
        assets: 1,
      },
    ).lean();

    if (session) {
      query.session(session);
    }

    const rebalancerList = await query;

    const groupIds = {};

    for (const rebalancer of rebalancerList) {
      for (const asset of rebalancer.assets || []) {
        const groupId = String(asset.groupId);
        const groupName = asset.groupName;

        if (groupId) {
          groupIds[groupId] = groupName;
        }
      }
    }

    return groupIds;
  } catch (error) {
    if (error instanceof customError) {
      throw error;
    }

    throw new customError(
      error.message || "Failed to get rebalancer list by user id",
      error.statusCode || 500,
    );
  }
};
