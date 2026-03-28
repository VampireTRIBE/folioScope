const mongoose = require("mongoose");

module.exports.validateID = (id) => {
  if (!id) return false;
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    String(new mongoose.Types.ObjectId(id)) === String(id)
  );
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
