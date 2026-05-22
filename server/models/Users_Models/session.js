const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: [true, "UserId Required"],
    },

    refreshToken: {
      type: String,
      required: [true, "RefreshToken Required"],
    },
    sessionId: {
      type: String,
      required: [true, "sessionId Required"],
    },

    ip: {
      type: String,
      required: [true, "IP Required"],
      maxlength: 45,
      trim: true,
    },

    userAgent: {
      type: String,
      required: [true, "User Agent Required"],
      trim: true,
    },

    revoke: {
      type: Boolean,
      default: false,
    },
    expires: { type: String, default: "7d" },
  },
  { timestamps: true },
);

sessionSchema.index({ userId: 1, revoke: 1, sessionId: 1 });
sessionSchema.index({ userId: 1, sessionId: 1 });
sessionSchema.index({ refreshToken: 1 });

module.exports = mongoose.model("Session", sessionSchema);
