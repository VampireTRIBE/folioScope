const {
  getSingleAssetMetaDataID,
  getSingleAssetMetaDataName,
} = require("../../cache/assetMetaDataCache");
const { parseISODate } = require("../../helpers_validaters/validateDate");

module.exports.validateAssetPriceHistory = async (
  data = null,
  dataType = "id",
  validateOnly = false,
) => {
  const isId = dataType === "id";
  if (!data?.assetId) {
    return { result: false, message: "AssetName is Empty", statusCode: 422 };
  }
  if (!data?.open || !data?.high || !data?.low || !data?.close) {
    return { result: false, message: "Missing Field", statusCode: 422 };
  }
  const date = await parseISODate(data?.date);

  const ASSET_METADATA = isId
    ? getSingleAssetMetaDataID(data.assetId)
    : getSingleAssetMetaDataName(data.assetId);

  if (!ASSET_METADATA) {
    return { result: false, message: "AssetName is Invalid", statusCode: 422 };
  }
  if (dataType !== "id") data.assetId = ASSET_METADATA._id;
  data.date = date;

  return validateOnly === false
    ? {
        result: true,
        message: "Validation Complete",
        statusCode: 200,
        data: data,
      }
    : {
        result: true,
        message: "Validation Complete",
        statusCode: 200,
      };
};
