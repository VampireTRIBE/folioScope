const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. AssetsData Model (The Parent)
// 2. Modification Only Done by Admin
// ==========================================
const AssetsMetaDataSchema = new Schema(
  {
    isin: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    tickerCode: {
      nse: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
      },
      bse: {
        type: String,
        unique: true,
        uppercase: true,
        trim: true,
      },
    },
    name: {
      type: String,
      required: true,
      unique: true,
      maxlength: 100,
      minlength: 5,
      trim: true,
    },
    overview: { type: String, required: true, maxlength: 500 },
    assetClass: { type: String, required: true, maxlength: 100 },
    category: { type: String, required: true, maxlength: 100 },
    subCategory: { type: String, required: true, maxlength: 100 },
    sector: { type: String, maxlength: 100, default: "NA" },
    industries: [{ type: String }],
    amc: { type: String, maxlength: 100, default: "NA" },
    country: { type: String, required: true, default: "India" },
  },
  { timestamps: true },
);

AssetsMetaDataSchema.index(
  { "tickerCode.nse": 1 },
  { unique: true, sparse: true },
);
AssetsMetaDataSchema.index(
  { "tickerCode.bse": 1 },
  { unique: true, sparse: true },
);

const AssetsMetaData = mongoose.model("AssetsMetaData", AssetsMetaDataSchema);
module.exports = AssetsMetaData;
