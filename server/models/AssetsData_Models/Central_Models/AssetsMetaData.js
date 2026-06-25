const mongoose = require("mongoose");
const { Schema } = mongoose;
const {
  validate_ISIN,
} = require("../../../utils/validations/contentValidator/ISIN_Validator");

const AssetMetaDataSchema = new Schema(
  {
    isin: {
      type: String,
      uppercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return validate_ISIN(v);
        },
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
      unique: true,
    },
    GF_TickerCode: {
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
    expenseRatio: {
      type: String,
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
  { isin: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isin: { $type: "string" },
    },
  },
);
AssetMetaDataSchema.index(
  { "tickerCode.nse": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "tickerCode.nse": { $type: "string" },
    },
  },
);
AssetMetaDataSchema.index(
  { "tickerCode.bse": 1 },
  {
    unique: true,
    partialFilterExpression: {
      "tickerCode.bse": { $type: "string" },
    },
  },
);

AssetMetaDataSchema.index({ assetClass: 1 });
AssetMetaDataSchema.index({ assetCategory: 1 });
AssetMetaDataSchema.index({ assetSubCategory: 1 });
AssetMetaDataSchema.index({ assetIndexName: 1 });
AssetMetaDataSchema.index({ assetSector: 1 });
AssetMetaDataSchema.index({ assetIndustry: 1 });
AssetMetaDataSchema.index({ assetAMC: 1 });

module.exports = mongoose.model("AssetMetaData", AssetMetaDataSchema);
