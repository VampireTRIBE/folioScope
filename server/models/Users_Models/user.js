const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    password: {
      type: String,
      required: true,
      trim: true,
    },

    role: {
      type: String,
      default: "client",
      enum: ["client", "admin"],
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isAdminVerified: {
      type: Boolean,
      default: false,
    },

    verificationLastSentAt: {
      type: Date,
    },

    verificationRetry: {
      type: Number,
      default: 1,
    },

    otp: { type: String, default: null },
    otpExpiry: { type: Date, default: null },

    otpLastSentAt: {
      type: Date,
    },

    otpRetry: {
      type: Number,
      default: 1,
    },
    passwordResetVerified: {
      type: Boolean,
      default: false,
    },

    passwordResetVerifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

module.exports = mongoose.model("users", userSchema);
