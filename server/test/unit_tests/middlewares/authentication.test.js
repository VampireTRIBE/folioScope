// test/unit_tests/middlewares/authentication.test.js

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../../../models/Users_Models/session", () => ({
  findOne: jest.fn(),
}));

const jwt = require("jsonwebtoken");
const SESSION_MODEL = require("../../../models/Users_Models/session");

const {
  verifyAccessToken,
  verifyEmailTokenCheck,
  verifyRefreshToken,
} = require("../../../middlewares/authentication");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("authentication middleware", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("verifyAccessToken", () => {
    test("rejects missing bearer token", async () => {
      const req = {
        headers: {},
      };
      const res = createResponse();
      const next = jest.fn();

      await verifyAccessToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Unauthorized",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("attaches user and session when access token is valid", async () => {
      const sessionDoc = {
        _id: "session-doc-id",
      };
      const req = {
        headers: {
          authorization: "Bearer access-token",
        },
      };
      const res = createResponse();
      const next = jest.fn();

      jwt.verify.mockReturnValue({
        id: "user-id",
        sessionDocId: "session-doc-id",
      });
      SESSION_MODEL.findOne.mockResolvedValue(sessionDoc);

      await verifyAccessToken(req, res, next);

      expect(jwt.verify).toHaveBeenCalledWith("access-token", "test-secret");
      expect(SESSION_MODEL.findOne).toHaveBeenCalledWith({
        _id: "session-doc-id",
        userId: "user-id",
        revoke: false,
        expiresAt: { $gt: expect.any(Date) },
      });
      expect(req.userId).toBe("user-id");
      expect(req.sessionDocId).toBe("session-doc-id");
      expect(req.sessionDoc).toBe(sessionDoc);
      expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects valid token when session is missing or expired", async () => {
      const req = {
        headers: {
          authorization: "Bearer access-token",
        },
      };
      const res = createResponse();
      const next = jest.fn();

      jwt.verify.mockReturnValue({
        id: "user-id",
        sessionDocId: "session-doc-id",
      });
      SESSION_MODEL.findOne.mockResolvedValue(null);

      await verifyAccessToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid or expired session",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("returns access-token expired response", async () => {
      const req = {
        headers: {
          authorization: "Bearer access-token",
        },
      };
      const res = createResponse();
      const next = jest.fn();

      jwt.verify.mockImplementation(() => {
        const error = new Error("expired");
        error.name = "TokenExpiredError";
        throw error;
      });

      await verifyAccessToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Access token expired",
      });
    });
  });

  describe("verifyEmailTokenCheck", () => {
    test("accepts email verification token", () => {
      const req = {
        headers: {
          authorization: "Bearer email-token",
        },
      };
      const res = createResponse();
      const next = jest.fn();

      jwt.verify.mockReturnValue({
        id: "user-id",
        type: "email_verify",
      });

      verifyEmailTokenCheck(req, res, next);

      expect(req.verifyEmailToken).toBe("email-token");
      expect(req.userId).toBe("user-id");
      expect(next).toHaveBeenCalledTimes(1);
    });

    test("rejects wrong email token type", () => {
      const req = {
        headers: {
          authorization: "Bearer wrong-token",
        },
      };
      const res = createResponse();
      const next = jest.fn();

      jwt.verify.mockReturnValue({
        id: "user-id",
        type: "access",
      });

      verifyEmailTokenCheck(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid token type",
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("verifyRefreshToken", () => {
    test("rejects missing refresh credentials", async () => {
      const req = {
        cookies: {},
      };
      const res = createResponse();
      const next = jest.fn();

      await verifyRefreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Credentials missing",
      });
      expect(next).not.toHaveBeenCalled();
    });

    test("rejects refresh token session mismatch", async () => {
      const req = {
        cookies: {
          refreshToken: "refresh-token",
          sessionId: "cookie-session-id",
        },
      };
      const res = createResponse();
      const next = jest.fn();

      jwt.verify.mockReturnValue({
        id: "user-id",
        sessionId: "token-session-id",
      });

      await verifyRefreshToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Session mismatch",
      });
      expect(SESSION_MODEL.findOne).not.toHaveBeenCalled();
    });

    test("attaches refresh session context when token is valid", async () => {
      const sessionDoc = {
        _id: "session-doc-id",
      };
      const req = {
        cookies: {
          refreshToken: "refresh-token",
          sessionId: "session-id",
        },
      };
      const res = createResponse();
      const next = jest.fn();

      jwt.verify.mockReturnValue({
        id: "user-id",
        sessionId: "session-id",
      });
      SESSION_MODEL.findOne.mockResolvedValue(sessionDoc);

      await verifyRefreshToken(req, res, next);

      expect(SESSION_MODEL.findOne).toHaveBeenCalledWith({
        userId: "user-id",
        sessionId: "session-id",
        revoke: false,
        expiresAt: { $gt: expect.any(Date) },
      });
      expect(req.userId).toBe("user-id");
      expect(req.sessionId).toBe("session-id");
      expect(req.refreshToken).toBe("refresh-token");
      expect(req.sessionDoc).toBe(sessionDoc);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
