const {
  hashRefreshToken: hashCrypto,
  hashPassword,
} = require("../../../../utils/authentication/authUtils");
const {
  sendOtpMail,
} = require("../../../../utils/authentication/SendMail/sendOTPMail");
const {
  find_validate_user,
} = require("../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const customError = require("../../../../utils/shared/error/customError");

module.exports.forgotPassword_Service = async (req, res, next) => {
  try {
    const { email } = req.body;

    const filterObj = {
      email,
    };

    const user = await find_validate_user({ filterObj });
    if (!user.isVerified) {
      throw new customError("VERIFYEMAIL", 400);
    }

    const now = Date.now();
    const lastOtpTime = user?.otpLastSentAt
      ? new Date(user.otpLastSentAt).getTime()
      : 0;

    // RESET RETRY COUNT AFTER 24 HOURS
    if (now - lastOtpTime > 24 * 60 * 60 * 1000) {
      user.otpRetry = 0;
    }

    if (now - lastOtpTime < 60 * 1000) {
      throw new customError("Retry after sometime", 429);
    }

    if (user.otpRetry >= 5) {
      throw new customError(
        "Max retry limit reached. Try again after 24 hours",
        429,
      );
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);
    const hashedOTP = hashCrypto(otp);

    await sendOtpMail(email, otp);

    user.otp = hashedOTP;
    user.otpExpiry = expiry;
    user.otpRetry += 1;
    user.otpLastSentAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: `OTP sent to ${email}`,
      email: email,
    });
  } catch (error) {
    next(error);
  }
};

module.exports.verifyOtp_Service = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const { email } = req.params;

    const filterObj = {
      email,
    };

    const user = await find_validate_user({ filterObj });
    if (!user.isVerified) {
      throw new customError("VERIFYEMAIL", 400);
    }

    if (!user.otp || !user.otpExpiry) {
      throw new customError("OTP not generated or already verified", 400);
    }

    if (user.otpExpiry < new Date()) {
      throw new customError("OTP has expired, Please request a new one", 400);
    }

    const hashedOTP = hashCrypto(otp);

    if (hashedOTP !== user.otp) {
      throw new customError("Invalid OTP", 400);
    }

    user.otp = null;
    user.otpExpiry = null;
    user.otpRetry = null;
    user.passwordResetVerified = true;
    user.passwordResetVerifiedAt = new Date();
    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports.confirmPassword_Service = async (req, res, next) => {
  try {
    const { newPassword, confirmPassword } = req.body;
    const { email } = req.params;

    const filterObj = {
      email,
    };

    const user = await find_validate_user({ filterObj });
    if (!user.isVerified) {
      throw new customError("VERIFYEMAIL", 400);
    }
    if (!user.passwordResetVerified) {
      throw new customError("OTP verification required", 403);
    }

    const now = Date.now();
    const verifiedAt = new Date(user.passwordResetVerifiedAt).getTime();
    const tenMinutes = 10 * 60 * 1000;

    if (now - verifiedAt > tenMinutes) {
      user.passwordResetVerified = false;
      user.passwordResetVerifiedAt = null;
      await user.save();
      throw new customError("Session expired. Please request a new OTP", 410);
    }

    const hashedPassword = await hashPassword(newPassword);
    user.passwordResetVerified = false;
    user.passwordResetVerifiedAt = null;

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully ",
    });
  } catch (error) {
    next(error);
  }
};
