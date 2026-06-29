// test/unit_tests/users/services/authServices/verificationService.test.js

const mockPortfolioGroupModel = {
  findOne: jest.fn(),
  create: jest.fn(),
};

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
  inTransaction: jest.fn(() => false),
};

jest.mock("mongoose", () => ({
  model: jest.fn(() => mockPortfolioGroupModel),
  startSession: jest.fn(() => mockSession),
}));

jest.mock("node:crypto", () => ({
  randomUUID: jest.fn(() => "session-id"),
}));

jest.mock("../../../../../utils/authentication/authUtils", () => ({
  generateJWTToken: jest.fn((payload, expiresIn) => {
    if (payload.type === "email_verify") return "email-verify-token";
    if (expiresIn === "7d") return "refresh-token";
    return "access-token";
  }),
}));

jest.mock(
  "../../../../../utils/authentication/SendMail/sendVerificationMail",
  () => ({
    sendVerificationMail: jest.fn(),
  }),
);

jest.mock(
  "../../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User",
  () => ({
    find_validate_user: jest.fn(),
  }),
);

jest.mock("../../../../../controllers/users/services/createSession", () => ({
  createSession: jest.fn(),
}));

jest.mock(
  "../../../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroupIDsBylevel",
  () => ({
    find_AllPortfolioGroups_BY_Level: jest.fn(),
  }),
);

jest.mock("../../../../../utils/mongodb/aggregations/get_LeafNodes", () => ({
  get_AllLeafNodes: jest.fn(),
}));

const {
  sendVerificationMail,
} = require("../../../../../utils/authentication/SendMail/sendVerificationMail");
const {
  find_validate_user,
} = require("../../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const {
  createSession,
} = require("../../../../../controllers/users/services/createSession");
const {
  find_AllPortfolioGroups_BY_Level,
} = require("../../../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroupIDsBylevel");
const {
  get_AllLeafNodes,
} = require("../../../../../utils/mongodb/aggregations/get_LeafNodes");
const {
  emailVerification_Service,
  emailVerify_Service,
} = require("../../../../../controllers/users/services/authServices/verificationService");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.cookie = jest.fn(() => res);
  return res;
};

const createUser = (overrides = {}) => ({
  _id: "user-id",
  firstName: "Jane",
  lastName: "Client",
  role: "client",
  isVerified: false,
  verificationRetry: 0,
  verificationLastSentAt: new Date("2026-06-28T10:00:00.000Z"),
  save: jest.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("verificationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-29T10:00:00.000Z"));
    mockSession.inTransaction.mockReturnValue(false);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("emailVerification_Service sends verification mail and records retry", async () => {
    const user = createUser({ verificationRetry: 3 });
    find_validate_user.mockResolvedValue(user);
    const res = createResponse();
    const next = jest.fn();

    await emailVerification_Service(
      { body: { email: "client@example.com" } },
      res,
      next,
    );

    expect(sendVerificationMail).toHaveBeenCalledWith(
      "email-verify-token",
      "client@example.com",
    );
    expect(user.verificationRetry).toBe(4);
    expect(user.verificationLastSentAt).toEqual(
      new Date("2026-06-29T10:00:00.000Z"),
    );
    expect(user.save).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test("emailVerification_Service rejects already verified account", async () => {
    find_validate_user.mockResolvedValue(createUser({ isVerified: true }));
    const res = createResponse();
    const next = jest.fn();

    await emailVerification_Service(
      { body: { email: "client@example.com" } },
      res,
      next,
    );

    expect(sendVerificationMail).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Account already verified",
        statusCode: 400,
      }),
    );
  });

  test("emailVerify_Service verifies user, creates root group, session, and group payload", async () => {
    const user = createUser();
    find_validate_user.mockResolvedValue(user);
    mockPortfolioGroupModel.findOne.mockResolvedValue(null);
    mockPortfolioGroupModel.create.mockResolvedValue([{ _id: "root-id" }]);
    createSession.mockResolvedValue({ sessionDocId: "session-doc-id" });
    get_AllLeafNodes.mockResolvedValue(["leaf-id"]);
    find_AllPortfolioGroups_BY_Level
      .mockResolvedValueOnce([{ _id: "root-id", isLeaf: false }])
      .mockResolvedValueOnce([{ _id: "leaf-id", isLeaf: true }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const res = createResponse();

    await emailVerify_Service({ userId: "user-id" }, res, jest.fn());

    expect(mockSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(user.isVerified).toBe(true);
    expect(user.save).toHaveBeenCalledWith({ session: mockSession });
    expect(mockPortfolioGroupModel.create).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          name: "NET WORTH",
          userId: "user-id",
        }),
      ],
      { session: mockSession },
    );
    expect(createSession).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-id",
        sessionId: "session-id",
        refreshToken: "refresh-token",
        session: mockSession,
      }),
    );
    expect(mockSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(res.cookie).toHaveBeenCalledWith(
      "refreshToken",
      "refresh-token",
      expect.any(Object),
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        accessToken: "access-token",
      }),
    );
  });
});
