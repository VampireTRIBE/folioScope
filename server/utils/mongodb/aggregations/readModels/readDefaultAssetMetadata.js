const mongoose = require("mongoose");
const customError = require("../../../shared/error/customError");
const {
  get_AssetMetaDataName,
} = require("../../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");
const { get_RawPastPricesbyAssetID } = require("../get_AssetsPrice");

module.exports.read_DefaultAssetMetadata = async () => {
  try {
    const assetMetaDataName = get_AssetMetaDataName();
    const defaultArray1 = ["NIFTY 50", "SENSEX", "NASDAQ 100"];
    const defaultArray2 = ["NIFTY NEXT 50", "NIFTY 100", "NIFTY MIDCAP 50"];
    const defaultArray3 = ["NIFTY BANK", "NIFTY IT", "NIFTY AUTO"];
    const assetsArray = [...defaultArray1, ...defaultArray2, ...defaultArray3];

    let bulkops = [];

    assetsArray.forEach((el) => {
      if (assetMetaDataName[el]) {
        bulkops.push(get_RawPastPricesbyAssetID(assetMetaDataName[el]._id));
      }
    });

    const results = await Promise.all(bulkops);
    const assetPrices = Object.assign({}, ...results);

    let data1 = [];
    let data2 = [];
    let data3 = [];

    const formatData = (dataArray, pushReffrence) => {
      let result = [];
      for (const el of dataArray) {
        if (!assetMetaDataName[el]) continue;
        const { _id, name } = assetMetaDataName[el];
        const path = assetPrices[_id] || [];
        const pathLength = path.length;
        const price = pathLength >= 1 ? path[pathLength - 1] : null;
        const today =
          pathLength >= 2
            ? ((path[pathLength - 1] - path[pathLength - 2]) /
                path[pathLength - 2]) *
              100
            : 0;
        result.push({
          id: _id,
          name,
          path,
          price: {
            price: price.toString(),
            today: today.toFixed(2).toString() + "%",
          },
        });
      }
      pushReffrence.push(result);
    };

    formatData(defaultArray1, data1);
    formatData(defaultArray2, data2);
    formatData(defaultArray3, data3);
    return { data1, data2, data3 };
  } catch (error) {
    throw new customError(error.message || "Database Error", 503);
  }
};
