const mongoose = require("mongoose");

module.exports.getAllUserIds = async (session = null) => {
  const User = mongoose.model("users");
  const query = User.find({}, { _id: 1 }).lean();
  if (session) {
    query.session(session);
  }
  const users = await query;
  return users.map((user) => user._id.toString());
};
