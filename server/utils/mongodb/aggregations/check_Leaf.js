const mongoose = require("mongoose");

module.exports.is_Leaf = async (Model, id, session = null) => {
  const result = await Model.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(id),
        isDeleted: false,
      },
    },
    {
      $lookup: {
        from: Model.collection.name,
        localField: "_id",
        foreignField: "parentId",
        pipeline: [{ $match: { isDeleted: false } }, { $limit: 1 }],
        as: "children",
      },
    },
    {
      $project: {
        userId: 1,
        consolidatedCash: 1,
        path: 1,
        isLeaf: { $eq: [{ $size: "$children" }, 0] },
      },
    },
  ]).session(session);

  if (!result.length) {
    throw new customError("Group not found", 404);
  }
  return result[0];
};
