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
      unique: true,
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
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

sessionSchema.index({
  userId: 1,
  sessionId: 1,
  revoke: 1,
});
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports =
  mongoose.models.Session || mongoose.model("Session", sessionSchema);
