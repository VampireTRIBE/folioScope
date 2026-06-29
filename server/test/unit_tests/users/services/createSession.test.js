// test/unit_tests/users/services/createSession.test.js

jest.mock("../../../../models/Users_Models/session", () => ({
  create: jest.fn(),
}));

jest.mock("../../../../utils/authentication/authUtils", () => ({
  hashRefreshToken: jest.fn(() => "hashed-refresh-token"),
}));

const SESSION_MODEL = require("../../../../models/Users_Models/session");
const {
  hashRefreshToken,
} = require("../../../../utils/authentication/authUtils");
const {
  createSession,
} = require("../../../../controllers/users/services/createSession");

describe("createSession", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates a hashed refresh-token session document", async () => {
    SESSION_MODEL.create.mockResolvedValue([
      {
        _id: "session-doc-id",
      },
    ]);

    const result = await createSession({
      userId: "user-id",
      sessionId: "session-id",
      refreshToken: "refresh-token",
      req: {
        ip: "127.0.0.1",
        headers: {
          "user-agent": "jest-agent",
        },
      },
      session: "mongo-session",
    });

    expect(hashRefreshToken).toHaveBeenCalledWith("refresh-token");
    expect(SESSION_MODEL.create).toHaveBeenCalledWith(
      [
        {
          userId: "user-id",
          sessionId: "session-id",
          refreshToken: "hashed-refresh-token",
          ip: "127.0.0.1",
          userAgent: "jest-agent",
          expiresAt: expect.any(Date),
        },
      ],
      { session: "mongo-session" },
    );
    expect(result).toEqual({
      sessionDocId: "session-doc-id",
    });
  });
});
