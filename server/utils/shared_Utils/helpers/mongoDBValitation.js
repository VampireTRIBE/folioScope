const mongoose = require("mongoose");

module.exports.validateID = (id) => {
  return async (req, res, next) => {
    const _id = req.params[id];
    if (
      !_id ||
      !mongoose.Types.ObjectId.isValid(_id) ||
      String(new mongoose.Types.ObjectId(_id)) !== String(_id)
    ) {
      return res.status(400).json({
        error: `Invalid Request ID`,
      });
    }
    next();
  };
};