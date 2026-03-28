const {
  getSingleAssetMetaDataID,
  getSingleAssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const {
  parseISODate,
} = require("../../../shared_Utils/helpers/DateValidation");

module.exports.validate_AssetPriceHistory = async (
  data = null,
  dataType = "id",
  validateOnly = false,
) => {
  const isId = dataType === "id";
  if (!data?.assetId) {
    return { result: false, message: "AssetName is Empty", statusCode: 422 };
  }
  if (!data?.open || !data?.high || !data?.low || !data?.close) {
    return { result: false, message: "Missing Field value", statusCode: 422 };
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
        data: data,
      }
    : {
        result: true,
      };
};
