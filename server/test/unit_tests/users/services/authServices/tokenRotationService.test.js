// test/unit_tests/users/services/authServices/tokenRotationService.test.js

jest.mock("../../../../../models/Users_Models/session", () => ({
  findOneAndUpdate: jest.fn(),
  updateMany: jest.fn(),
}));

jest.mock("../../../../../utils/authentication/authUtils", () => ({
  hashRefreshToken: jest.fn((token) => `hashed-${token}`),
  generateJWTToken: jest.fn((payload, expiresIn) =>
    expiresIn === "7d" ? "new-refresh-token" : "new-access-token",
  ),
}));

jest.mock(
  "../../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User",
  () => ({
    find_validate_user: jest.fn(),
  }),
);

const SESSION_MODEL = require("../../../../../models/Users_Models/session");
const {
  find_validate_user,
} = require("../../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const {
  accessTokenRotation_Service,
} = require("../../../../../controllers/users/services/authServices/tokenRotationService");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  res.clearCookie = jest.fn(() => res);
  return res;
};

describe("accessTokenRotation_Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("rotates refresh token and returns a new access token", async () => {
    const req = {
      refreshToken: "old-refresh-token",
      userId: "user-id",
      sessionDoc: {
        _id: "session-doc-id",
        sessionId: "session-id",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    find_validate_user.mockResolvedValue({
      _id: "user-id",
      isVerified: true,
    });

    SESSION_MODEL.findOneAndUpdate.mockResolvedValue({
      _id: "updated-session-doc-id",
      sessionId: "session-id",
    });

    await accessTokenRotation_Service(req, res, next);

    expect(SESSION_MODEL.findOneAndUpdate).toHaveBeenCalledWith(
      {
        _id: "session-doc-id",
        refreshToken: "hashed-old-refresh-token",
        revoke: false,
        expiresAt: { $gt: expect.any(Date) },
      },
      {
        refreshToken: "hashed-new-refresh-token",
        lastUsedAt: expect.any(Date),
        expiresAt: expect.any(Date),
      },
      {
        new: true,
      },
    );

    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "new-refresh-token",
      expect.any(Object),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      "sessionId",
      "session-id",
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "Access token generated",
      accessToken: "new-access-token",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("revokes all sessions on refresh token reuse detection", async () => {
    const req = {
      refreshToken: "old-refresh-token",
      userId: "user-id",
      sessionDoc: {
        _id: "session-doc-id",
        sessionId: "session-id",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    find_validate_user.mockResolvedValue({
      _id: "user-id",
      isVerified: true,
    });

    SESSION_MODEL.findOneAndUpdate.mockResolvedValue(null);

    await accessTokenRotation_Service(req, res, next);

    expect(SESSION_MODEL.updateMany).toHaveBeenCalledWith(
      { userId: "user-id" },
      { revoke: true },
    );
    expect(res.clearCookie).toHaveBeenCalledWith(
      "refreshToken",
      expect.any(Object),
    );
    expect(res.clearCookie).toHaveBeenCalledWith("sessionId", expect.any(Object));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Refresh token reuse detected",
        statusCode: 403,
      }),
    );
  });
});
