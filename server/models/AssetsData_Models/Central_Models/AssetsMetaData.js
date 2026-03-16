const mongoose = require("mongoose");
const { Schema } = mongoose;
const validateISIN = require("../../../utils/helpers_validaters/ISIN_Validation");

const AssetMetaDataSchema = new Schema(
  {
    isin: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      validate: {
        validator: validateISIN,
        message: "Invalid ISIN",
      },
    },

    tickerCode: {
      nse: { type: String, uppercase: true, trim: true },
      bse: { type: String, uppercase: true, trim: true },
    },

    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },

    overview: {
      type: String,
      maxlength: 500,
    },

    currency: {
      type: String,
      required: true,
      trim: true,
    },

    assetClass: {
      type: Schema.Types.ObjectId,
      ref: "AssetClass",
      required: true,
    },

    assetCategory: {
      type: Schema.Types.ObjectId,
      ref: "AssetCategory",
      required: true,
    },

    assetSubCategory: {
      type: Schema.Types.ObjectId,
      ref: "AssetSubCategory",
      required: true,
    },

    assetIndexName: {
      type: Schema.Types.ObjectId,
      ref: "AssetIndexName",
    },

    assetSector: {
      type: Schema.Types.ObjectId,
      ref: "AssetSector",
    },

    assetIndustry: {
      type: Schema.Types.ObjectId,
      ref: "AssetIndustry",
    },

    assetAMC: {
      type: Schema.Types.ObjectId,
      ref: "AssetAMC",
    },
  },
  { timestamps: true },
);

AssetMetaDataSchema.index(
  { "tickerCode.nse": 1 },
  { unique: true, sparse: true },
);
AssetMetaDataSchema.index({ isin: 1 }, { unique: true, sparse: true });
AssetMetaDataSchema.index(
  { "tickerCode.bse": 1 },
  { unique: true, sparse: true },
);

AssetMetaDataSchema.index({ assetClass: 1 });
AssetMetaDataSchema.index({ assetCategory: 1 });
AssetMetaDataSchema.index({ assetSubCategory: 1 });
AssetMetaDataSchema.index({ assetIndexName: 1 });
AssetMetaDataSchema.index({ assetSector: 1 });
AssetMetaDataSchema.index({ assetIndustry: 1 });
AssetMetaDataSchema.index({ assetAMC: 1 });

AssetMetaDataSchema.pre("validate", async function (next) {
  try {
    const AssetClassModel = mongoose.model("AssetClass");
    const AssetCategoryModel = mongoose.model("AssetCategory");
    const AssetSubCategoryModel = mongoose.model("AssetSubCategory");
    const AssetIndustryModel = mongoose.model("AssetIndustry");
    const AssetIndexNameModel = mongoose.model("AssetIndexName");

    const assetClass = await AssetClassModel.findById(this.assetClass);
    const category = await AssetCategoryModel.findById(this.assetCategory);
    const subcategory = await AssetSubCategoryModel.findById(
      this.assetSubCategory,
    );

    if (!category.assetClass.equals(this.assetClass)) {
      return next(new Error("Category does not belong to AssetClass"));
    }
    if (!subcategory.assetCategory.equals(this.assetCategory)) {
      return next(new Error("SubCategory does not belong to Category"));
    }

    // STOCK validations
    if (assetClass.name === "STOCK") {
      if (!this.assetSector) {
        return next(new Error("STOCK must have assetSector"));
      }
      if (!this.assetIndustry) {
        return next(new Error("STOCK must have assetIndustry"));
      }
      if (this.assetAMC) {
        return next(new Error("STOCK cannot have assetAMC"));
      }
      if (this.assetIndexName) {
        return next(new Error("STOCK cannot have assetIndexName"));
      }
    }

    // MUTUAL FUND validations
    if (assetClass.name === "MUTUAL FUND") {
      if (!this.assetAMC) {
        return next(new Error("MUTUAL FUND must have assetAMC"));
      }
      if (this.assetIndexName) {
        return next(new Error("MUTUAL FUND cannot have assetIndexName"));
      }
      if (
        subcategory.name === "Sectoral Fund" ||
        subcategory.name === "Thematic Fund"
      ) {
        if (!this.assetSector) {
          return next(
            new Error("Sectoral/Thematic funds must have assetSector"),
          );
        }
      }
    }

    // ETF validations
    if (assetClass.name === "ETF") {
      if (!this.assetAMC) {
        return next(new Error("ETF must have assetAMC"));
      }
      if (this.assetIndexName) {
        return next(new Error("ETF cannot have assetIndexName"));
      }
      if (
        category.name === "Sectoral ETF" ||
        category.name === "Thematic ETF"
      ) {
        if (!this.assetSector) {
          return next(new Error("Sectoral/Thematic ETF must have assetSector"));
        }
      }
    }

    // BOND validations
    if (assetClass.name === "BOND") {
      if (this.assetAMC) {
        return next(new Error("BOND cannot have assetAMC"));
      }
      if (this.assetIndexName) {
        return next(new Error("BOND cannot have assetIndexName"));
      }
    }

    // INDEX validations
    if (assetClass.name === "INDEX") {
      if (this.assetAMC) {
        return next(new Error("INDEX cannot have assetAMC"));
      }

      // Equity Index requires assetIndexName
      if (category.name === "Equity Index") {
        if (!this.assetIndexName) {
          return next(new Error("INDEX Equity Index must have assetIndexName"));
        }

        // Validate assetIndexName belongs to assetSubCategory
        const indexName = await AssetIndexNameModel.findById(
          this.assetIndexName,
        );
        if (!indexName.assetSubCategory.equals(this.assetSubCategory)) {
          return next(
            new Error("AssetIndexName does not belong to AssetSubCategory"),
          );
        }
      }
    }

    // Industry-Sector consistency
    if (this.assetIndustry) {
      if (!this.assetSector) {
        return next(new Error("assetIndustry requires assetSector"));
      }
      const industry = await AssetIndustryModel.findById(this.assetIndustry);
      if (!industry.assetSector.equals(this.assetSector)) {
        return next(new Error("Industry does not belong to Sector"));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("AssetMetaData", AssetMetaDataSchema);
