const {
  assetMetaData_joi_Schema,
} = require("../joi_Schema/assetMetadataSchema");

module.exports.validate_AssetMetadata = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      error: "Invalid PayLoad",
    });
  }
  const { error } = assetMetaData_joi_Schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
    });
  }
  next();
};
