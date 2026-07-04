const mongoose = require("mongoose");

module.exports.get_AllUserIDs = async (session = null) => {
  const User = mongoose.model("users");
  const query = User.find({}).lean();
  if (session) {
    query.session(session);
  }
  const users = await query;
  return users.map((user) => user._id.toString());
};
