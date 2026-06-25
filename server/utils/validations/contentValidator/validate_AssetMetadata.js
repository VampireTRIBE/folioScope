const {
  get_AssetClassificationStructureID,
  get_AssetClassificationStructureName,
  get_SectorClasificationStructureID,
  get_SectorClassificationStructureName,
  get_AMCClasificationStructureID,
  get_AMCClassificationStructureName,
} = require("../../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

module.exports.validate_AssetMetadata = async (
  data = null,
  dataType = "id",
  validateOnly = false,
) => {
  const isId = dataType === "id";
  console.log(data)

  const baseFields = [
    "name",
    "currency",
    "assetClass",
    "assetCategory",
    "assetSubCategory",
  ];

  const ASSET_CLASSIFICATION = isId
    ? get_AssetClassificationStructureID()
    : get_AssetClassificationStructureName();

  const SECTOR_CLASSIFICATION = isId
    ? get_SectorClasificationStructureID()
    : get_SectorClassificationStructureName();

  const AMC_CLASSIFICATION = isId
    ? get_AMCClasificationStructureID()
    : get_AMCClassificationStructureName();

  // -------------------- BASIC VALIDATION --------------------

  if (!data) {
    return { result: false, message: "Insufficient Data", statusCode: 422 };
  }

  for (const field of baseFields) {
    if (!(field in data) || data[field] == null) {
      return { result: false, message: "Insufficient Data", statusCode: 422 };
    }
  }

  // -------------------- HIERARCHY EXTRACTION --------------------
  const assetClassObj = ASSET_CLASSIFICATION[data.assetClass];
  if (!assetClassObj) {
    return { result: false, message: "Invalid AssetClass", statusCode: 422 };
  }

  const categoryObj = assetClassObj.category?.[data.assetCategory];
  if (!categoryObj) {
    return {
      result: false,
      message: "Invalid Asset Category",
      statusCode: 422,
    };
  }

  const subCategoryObj = categoryObj.subcategory?.[data.assetSubCategory];
  if (!subCategoryObj) {
    return {
      result: false,
      message: "Invalid Asset SubCategory",
      statusCode: 422,
    };
  }

  const requiredFields = assetClassObj.requiredFields || [];
  const forbiddenFields = assetClassObj.forbiddenFields || [];

  // -------------------- REQUIRED FIELDS --------------------

  for (const field of requiredFields) {
    if (!(field in data)) {
      return {
        result: false,
        message: `Missing ${field} Field for ${data.assetClass}`,
        statusCode: 422,
      };
    }
  }

  // -------------------- INDEX VALIDATION --------------------

  const indexMap = subCategoryObj.indexName || {};
  const hasIndex = Object.keys(indexMap).length > 0;
  const indexObj = data.assetIndexName ? indexMap[data.assetIndexName] : null;

  if (hasIndex) {
    if (!data.assetIndexName) {
      if (requiredFields.includes("assetIndexName")) {
        return {
          result: false,
          message: "Missing assetIndexName",
          statusCode: 422,
        };
      }
    } else if (!indexObj) {
      return {
        result: false,
        message: "Invalid Index Name",
        statusCode: 422,
      };
    }
  } else {
    if (data.assetIndexName != null) {
      return {
        result: false,
        message: "assetIndexName not allowed for this subcategory",
        statusCode: 422,
      };
    }
  }

  // -------------------- SECTOR VALIDATION --------------------

  let sectorObj = null;
  let industryObj = null;

  if (requiredFields.includes("assetSector")) {
    if (
      !("assetSector" in data) ||
      data.assetSector == null ||
      !("assetIndustry" in data) ||
      data.assetIndustry == null
    ) {
      return {
        result: false,
        message: "Missing Sector or Industry",
        statusCode: 422,
      };
    }

    sectorObj = SECTOR_CLASSIFICATION[data.assetSector];
    industryObj = sectorObj?.industry?.[data.assetIndustry];

    if (!sectorObj || !industryObj) {
      return {
        result: false,
        message: "Invalid Sector Hierarchy",
        statusCode: 422,
      };
    }
  }

  // -------------------- AMC VALIDATION --------------------

  let amcObj = null;
  let expenseRatio = null;

  if (requiredFields.includes("assetAMC")) {
    if (!("assetAMC" in data) || data.assetAMC == null) {
      return {
        result: false,
        message: "Missing assetAMC",
        statusCode: 422,
      };
    }

    amcObj = AMC_CLASSIFICATION[data.assetAMC];

    if (!amcObj) {
      return {
        result: false,
        message: "Invalid AMC NAME",
        statusCode: 422,
      };
    }
    if (!("expenseRatio" in data) || data.expenseRatio == null) {
      return {
        result: false,
        message: "Missing Expense Ratio Field",
        statusCode: 422,
      };
    }
    expenseRatio = data.expenseRatio;
    console.log(data.expenseRatio);
  }

  // -------------------- FORBIDDEN FIELDS --------------------

  for (const field of forbiddenFields) {
    if (field in data && data[field] != null) {
      return {
        result: false,
        message: `Forbidden ${field} Field for ${data.assetClass}`,
        statusCode: 422,
      };
    }
  }

  // -------------------- BUILD FINAL DOC (ONLY IDS) --------------------

  const doc = {
    isin: data.isin || null,
    tickerCode: {
      nse: data.tickerCode?.nse ?? null,
      bse: data.tickerCode?.bse ?? null,
    },
    name: data.name,
    GF_TickerCode: data?.GF_TickerCode ?? null,
    overview: data.overview || null,
    currency: data.currency,

    assetClass: isId ? data.assetClass : assetClassObj._id,
    assetCategory: isId ? data.assetCategory : categoryObj._id,
    assetSubCategory: isId ? data.assetSubCategory : subCategoryObj._id,
  };

  // indexName
  if (hasIndex && data.assetIndexName) {
    doc.assetIndexName = isId ? data.assetIndexName : indexObj._id;
  }

  // sector + industry
  if (requiredFields.includes("assetSector")) {
    doc.assetSector = isId ? data.assetSector : sectorObj._id;
    doc.assetIndustry = isId ? data.assetIndustry : industryObj._id;
  }

  // AMC
  if (requiredFields.includes("assetAMC")) {
    doc.assetAMC = isId ? data.assetAMC : amcObj._id;
    doc.expenseRatio = expenseRatio;
  }

  console.log();
  console.log(doc);
  console.log();

  return validateOnly === false
    ? {
        result: true,
        message: "Validation Complete",
        statusCode: 200,
        data: doc,
      }
    : {
        result: true,
        message: "Validation Complete",
        statusCode: 200,
      };
};
