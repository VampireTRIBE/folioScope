// test/unit_tests/users/services/authServices/passwordResetService.test.js

jest.mock("../../../../../utils/authentication/authUtils", () => ({
  hashRefreshToken: jest.fn((token) => `hashed-${token}`),
  hashPassword: jest.fn(async (password) => `hashed-password-${password}`),
}));

jest.mock(
  "../../../../../utils/authentication/SendMail/sendOTPMail",
  () => ({
    sendOtpMail: jest.fn(),
  }),
);

jest.mock(
  "../../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User",
  () => ({
    find_validate_user: jest.fn(),
  }),
);

const {
  hashPassword,
} = require("../../../../../utils/authentication/authUtils");
const {
  sendOtpMail,
} = require("../../../../../utils/authentication/SendMail/sendOTPMail");
const {
  find_validate_user,
} = require("../../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const {
  forgotPassword_Service,
  verifyOtp_Service,
  confirmPassword_Service,
} = require("../../../../../controllers/users/services/authServices/passwordResetService");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const createUser = (overrides = {}) => ({
  _id: "user-id",
  email: "client@example.com",
  isVerified: true,
  otpRetry: 0,
  otpLastSentAt: new Date("2026-06-28T10:00:00.000Z"),
  save: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("passwordResetService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-29T10:00:00.000Z"));
    jest.spyOn(Math, "random").mockReturnValue(0.123456);
  });

  afterEach(() => {
    Math.random.mockRestore();
    jest.useRealTimers();
  });

  test("forgotPassword_Service sends hashed OTP and stores retry metadata", async () => {
    const user = createUser({ otpRetry: 2 });
    find_validate_user.mockResolvedValue(user);
    const req = { body: { email: "client@example.com" } };
    const res = createResponse();
    const next = jest.fn();

    await forgotPassword_Service(req, res, next);

    expect(find_validate_user).toHaveBeenCalledWith({
      filterObj: { email: "client@example.com" },
    });
    expect(sendOtpMail).toHaveBeenCalledWith("client@example.com", "211110");
    expect(user.otp).toBe("hashed-211110");
    expect(user.otpRetry).toBe(3);
    expect(user.otpExpiry).toEqual(new Date("2026-06-29T10:10:00.000Z"));
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test("forgotPassword_Service blocks rapid OTP retry", async () => {
    find_validate_user.mockResolvedValue(
      createUser({ otpLastSentAt: new Date("2026-06-29T09:59:30.000Z") }),
    );
    const res = createResponse();
    const next = jest.fn();

    await forgotPassword_Service(
      { body: { email: "client@example.com" } },
      res,
      next,
    );

    expect(sendOtpMail).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Retry after sometime",
        statusCode: 429,
      }),
    );
  });

  test("verifyOtp_Service validates OTP and enables password reset window", async () => {
    const user = createUser({
      otp: "hashed-123456",
      otpExpiry: new Date("2026-06-29T10:05:00.000Z"),
      otpRetry: 1,
    });
    find_validate_user.mockResolvedValue(user);
    const res = createResponse();
    const next = jest.fn();

    await verifyOtp_Service(
      { params: { email: "client@example.com" }, body: { otp: "123456" } },
      res,
      next,
    );

    expect(user.otp).toBeNull();
    expect(user.otpExpiry).toBeNull();
    expect(user.otpRetry).toBeNull();
    expect(user.passwordResetVerified).toBe(true);
    expect(user.passwordResetVerifiedAt).toEqual(
      new Date("2026-06-29T10:00:00.000Z"),
    );
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "OTP verified successfully",
    });
  });

  test("confirmPassword_Service changes password after OTP verification", async () => {
    const user = createUser({
      passwordResetVerified: true,
      passwordResetVerifiedAt: new Date("2026-06-29T09:55:00.000Z"),
    });
    find_validate_user.mockResolvedValue(user);
    const res = createResponse();
    const next = jest.fn();

    await confirmPassword_Service(
      {
        params: { email: "client@example.com" },
        body: {
          newPassword: "new-password",
          confirmPassword: "new-password",
        },
      },
      res,
      next,
    );

    expect(hashPassword).toHaveBeenCalledWith("new-password");
    expect(user.password).toBe("hashed-password-new-password");
    expect(user.passwordResetVerified).toBe(false);
    expect(user.passwordResetVerifiedAt).toBeNull();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test("confirmPassword_Service expires stale OTP verification", async () => {
    const user = createUser({
      passwordResetVerified: true,
      passwordResetVerifiedAt: new Date("2026-06-29T09:40:00.000Z"),
    });
    find_validate_user.mockResolvedValue(user);
    const res = createResponse();
    const next = jest.fn();

    await confirmPassword_Service(
      {
        params: { email: "client@example.com" },
        body: {
          newPassword: "new-password",
          confirmPassword: "new-password",
        },
      },
      res,
      next,
    );

    expect(user.passwordResetVerified).toBe(false);
    expect(user.passwordResetVerifiedAt).toBeNull();
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(hashPassword).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Session expired. Please request a new OTP",
        statusCode: 410,
      }),
    );
  });
});
