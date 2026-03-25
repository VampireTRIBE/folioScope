const AssetClassModel = require("../../../models/AssetsData_Models/Classification_Models/AssetClass");
const AssetSectorModel = require("../../../models/AssetsData_Models/Classification_Models/AssetSector");
const AssetAMCModel = require("../../../models/AssetsData_Models/Classification_Models/AssetAMC");
const AssetMetaDataModel = require("../../../models/AssetsData_Models/Central_Models/AssetsMetaData");
const customError = require("../../errorClass/customError");

module.exports.buildAssetClassTreeStructure = async () => {
  try {
    const result = await AssetClassModel.aggregate([
      {
        $lookup: {
          from: "assetcategories",
          let: { classId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$assetClass", "$$classId"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
            {
              $lookup: {
                from: "assetsubcategories",
                let: { categoryId: "$_id" },
                pipeline: [
                  {
                    $match: {
                      $expr: { $eq: ["$assetCategory", "$$categoryId"] },
                    },
                  },
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                    },
                  },
                  {
                    $lookup: {
                      from: "assetindexnames",
                      let: { subId: "$_id" },
                      pipeline: [
                        {
                          $match: {
                            $expr: { $eq: ["$assetSubCategory", "$$subId"] },
                          },
                        },
                        {
                          $project: {
                            _id: 1,
                            name: 1,
                          },
                        },
                      ],
                      as: "indexName",
                    },
                  },
                ],
                as: "subcategory",
              },
            },
          ],
          as: "category",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          requiredFields: 1,
          forbiddenFields: 1,
          category: 1,
        },
      },
    ]);
    return result;
  } catch (error) {
    throw new customError("Internal Server Error", 500);
  }
};

module.exports.buildAssetSectorTreeStructure = async () => {
  try {
    const result = await AssetSectorModel.aggregate([
      {
        $lookup: {
          from: "assetindustries",
          let: { classId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$assetSector", "$$classId"] },
              },
            },
            {
              $project: {
                _id: 1,
                name: 1,
              },
            },
          ],
          as: "industry",
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          industry: 1,
        },
      },
    ]);
    return result;
  } catch (error) {
    throw new customError("Internal Server Error", 500);
  }
};

module.exports.buildAssetAMCTreeStructure = async () => {
  try {
    const result = await AssetAMCModel.find().select("name").lean();
    return result;
  } catch (error) {
    throw new customError("Internal Server Error", 500);
  }
};

module.exports.buildAssetMetaData = async () => {
  try {
    const result = await AssetMetaDataModel.find().lean();
    return result;
  } catch (error) {
    throw new customError("Internal Server Error", 500);
  }
};
