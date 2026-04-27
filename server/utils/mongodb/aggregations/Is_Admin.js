const mongoose = require("mongoose");
const customError = require("../../shared/error/customError");

module.exports.is_Admin = async (id) => {
  const userModel = mongoose.model("users");
  const userDoc = await userModel.findOne({ _id: id, role: "admin" });
  if (!userDoc) {
    throw new customError("Unauthorized", 401);
  }
  return true;
};
