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

module.exports.getId = (Model, name) => {
  return Model.findOne({ name })
    .select("_id")
    .then((doc) => doc?._id);
};

module.exports.validateDocumentRelation = async (
  parentID,
  childID,
  childModel,
  fieldName,
) => {
  if (!parentID || !childID || !childModel || !fieldName) {
    return false;
  }
  try {
    const exists = await childModel.exists({
      _id: childID,
      [fieldName]: parentID,
    });
    return !!exists;
  } catch (error) {
    return false;
  }
};
