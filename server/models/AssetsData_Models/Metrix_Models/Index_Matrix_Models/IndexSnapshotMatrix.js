const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// ==========================================
// 1. IndexMetrixSnapshotSchema Model (Daily Based Financial Ratios)
// 2. Atutomatic Update
// ==========================================
const IndexMetrixSnapshotSchema = new Schema(
  {
    assetId: {
      type: Schema.Types.ObjectId,
      ref: "AssetsMetaData",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
      set: function (val) {
        if (val instanceof Date) {
          const d = new Date(val);
          d.setUTCHours(0, 0, 0, 0);
          return d;
        }
        const parsed = new Date(val);
        parsed.setUTCHours(0, 0, 0, 0);
        return parsed;
      },
    },
    pe: { type: Number },
    dividendYield: { type: Number },
    marketCap: { type: Number },
  },
  { timestamps: true },
);

IndexMetrixSnapshotSchema.index({ assetId: 1, date: -1 }, { unique: true });

const AssetMetrixSnapshot = mongoose.model(
  "IndexMetrixSnapshot",
  IndexMetrixSnapshotSchema,
);

// ==========================================
// Exports
// ==========================================
module.exports = AssetMetrixSnapshot;
