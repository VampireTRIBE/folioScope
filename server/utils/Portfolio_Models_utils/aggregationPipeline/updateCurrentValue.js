module.exports.updateCurrentValue = async (
  Model,
  ids,
  priceMap,
  session = null,
) => {
  /*
    priceMap = {
      assetId1: CMP,
      assetId2: CMP
    }
  */

  const assets = await Model.find({ _id: { $in: ids } }).select(
    "_id snapshot.totalQty",
  );

  const bulkOps = assets.map((asset) => {
    const CMP = priceMap[asset._id.toString()] || 0;
    const totalQty = asset.snapshot?.totalQty || 0;

    return {
      updateOne: {
        filter: { _id: asset._id },
        update: {
          $set: {
            "snapshot.currentValue": totalQty * CMP,
          },
        },
      },
    };
  });

  if (bulkOps.length > 0) {
    await Model.bulkWrite(bulkOps, { session });
  }
};
