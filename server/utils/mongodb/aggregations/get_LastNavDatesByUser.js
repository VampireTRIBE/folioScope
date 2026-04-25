const mongoose = require("mongoose");
module.exports.get_LastNavDatesByUser = async (session = null) => {
  const NavPerformanceModel = mongoose.model("navPerformence");
  const data = await NavPerformanceModel.aggregate([
    {
      $sort: { userId: 1, date: -1 },
    },
    {
      $group: {
        _id: "$userId",
        lastNavDate: { $first: "$date" },
      },
    },
  ]).session(session);
  const result = {};
  for (const item of data) {
    result[item._id.toString()] = {
      lastNavDate: item.lastNavDate,
    };
  }
  return result;
};
