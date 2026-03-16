const mongoose = require("mongoose");
const { Schema } = mongoose;

const AssetIndexNameSchema = new Schema(
  {
    name: { type: String, required: true },
    assetSubCategory: {
      type: Schema.Types.ObjectId,
      ref: "AssetSubCategory",
      required: true,
    },
  },
  { timestamps: true },
);

AssetIndexNameSchema.index({ name: 1, assetSubCategory: 1 }, { unique: true });

module.exports = mongoose.model("AssetIndexName", AssetIndexNameSchema);