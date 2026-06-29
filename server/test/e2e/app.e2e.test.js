// test/e2e/app.e2e.test.js

jest.mock("../../models/Users_Models/session", () => ({
  findOne: jest.fn(),
}));

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn(),
}));

jest.mock("../../controllers/users/services/authServices/loginService", () => ({
  register_Service: jest.fn(),
  login_Service: jest.fn(),
  logoutUser_Service: jest.fn(),
  logoutAllUser_Service: jest.fn(),
}));

jest.mock("../../controllers/users/services/ReadServices/userService", () => ({
  Read_UserDetails_Service: jest.fn(),
}));

jest.mock("../../controllers/users/services/authServices/verificationService", () => ({
  emailVerification_Service: jest.fn(),
  emailVerify_Service: jest.fn(),
}));

jest.mock("../../controllers/users/services/authServices/tokenRotationService", () => ({
  accessTokenRotation_Service: jest.fn(),
}));

jest.mock("../../controllers/users/services/authServices/passwordResetService", () => ({
  forgotPassword_Service: jest.fn(),
  verifyOtp_Service: jest.fn(),
  confirmPassword_Service: jest.fn(),
}));

jest.mock("../../controllers/portfolio/portfolioGroupControllers", () => ({
  addGroup: jest.fn(),
  deleteGroup: jest.fn(),
  updateGroup: jest.fn(),
  get_GroupMetadata: jest.fn(),
  fetch_UserHoldings: jest.fn(),
  createRebalancer: jest.fn(),
  fetchRebalancerList: jest.fn(),
  fetchRebalancerById: jest.fn(),
}));

jest.mock("../../controllers/portfolio/portfolioGroupStatementControllers", () => ({
  groupstatementTransaction: jest.fn(),
}));

jest.mock("../../controllers/portfolio/portfolioTradeControllers", () => ({
  trade: jest.fn(),
}));

jest.mock(
  "../../controllers/analytic/PriceAnalytic/priceAnalyticController",
  () => ({
    priceSecurityDrawdownAnalytic: jest.fn(),
    priceGroupDrawdownAnalytic: jest.fn(),
    xirrAnalytic: jest.fn(),
    xirrComparison: jest.fn(),
    navComparison: jest.fn(),
  }),
);

jest.mock(
  "../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache",
  () => ({
    get_AssetMetaDataName: jest.fn(),
    get_AssetMetaDataID: jest.fn(),
  }),
);

jest.mock(
  "../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache",
  () => ({
    get_NAMEIDMAP: jest.fn(),
  }),
);

const http = require("node:http");

const jwt = require("jsonwebtoken");
const SESSION_MODEL = require("../../models/Users_Models/session");
const customError = require("../../utils/shared/error/customError");

const {
  register_Service,
  login_Service,
  logoutUser_Service,
  logoutAllUser_Service,
} = require("../../controllers/users/services/authServices/loginService");

const {
  emailVerification_Service,
  emailVerify_Service,
} = require("../../controllers/users/services/authServices/verificationService");

const {
  accessTokenRotation_Service,
} = require("../../controllers/users/services/authServices/tokenRotationService");

const {
  forgotPassword_Service,
  verifyOtp_Service,
  confirmPassword_Service,
} = require("../../controllers/users/services/authServices/passwordResetService");

const {
  Read_UserDetails_Service,
} = require("../../controllers/users/services/ReadServices/userService");

const {
  fetch_UserHoldings,
  createRebalancer,
  fetchRebalancerList,
  fetchRebalancerById,
} = require("../../controllers/portfolio/portfolioGroupControllers");

const {
  groupstatementTransaction,
} = require("../../controllers/portfolio/portfolioGroupStatementControllers");

const {
  trade,
} = require("../../controllers/portfolio/portfolioTradeControllers");

const {
  priceSecurityDrawdownAnalytic,
  priceGroupDrawdownAnalytic,
  xirrAnalytic,
  xirrComparison,
  navComparison,
} = require("../../controllers/analytic/PriceAnalytic/priceAnalyticController");

const {
  get_AssetMetaDataName,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetMetaDataCache");

const {
  get_NAMEIDMAP,
} = require("../../init_Scripts/init_Cache/AssetsData_Models_Cache/init_cacheFiles/assetClassificationCache");

const { createApp } = require("../../app");

const createTestServer = async () => {
  const app = createApp();

  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const { port } = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${port}`,
      });
    });
  });
};

const closeTestServer = async (server) => {
  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
};

const requestJson = async ({
  baseUrl,
  method = "GET",
  path,
  body,
  headers = {},
}) => {
  const payload = body === undefined ? null : JSON.stringify(body);
  const url = new URL(path, baseUrl);

  return new Promise((resolve, reject) => {
    const req = http.request(
      url,
      {
        method,
        headers: {
          ...(payload
            ? {
                "content-type": "application/json",
                "content-length": Buffer.byteLength(payload),
              }
            : {}),
          ...headers,
        },
      },
      (res) => {
        const chunks = [];

        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const rawBody = Buffer.concat(chunks).toString("utf8");
          const parsedBody = rawBody ? JSON.parse(rawBody) : null;

          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsedBody,
          });
        });
      },
    );

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }

    req.end();
  });
};

const userId = "64f000000000000000000001";
const sessionDocId = "64f000000000000000000002";
const groupId = "64f000000000000000000003";
const assetId = "64f000000000000000000004";
const rebalancerId = "64f000000000000000000005";
const indexId = "64f000000000000000000006";

const mockValidAccessToken = () => {
  const sessionDoc = {
    _id: sessionDocId,
  };

  jwt.verify.mockReturnValue({
    id: userId,
    sessionDocId,
  });

  SESSION_MODEL.findOne.mockResolvedValue(sessionDoc);

  return {
    authorization: "Bearer access-token",
  };
};

describe("server E2E app routes", () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const testServer = await createTestServer();
    server = testServer.server;
    baseUrl = testServer.baseUrl;
  });

  afterAll(async () => {
    await closeTestServer(server);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  test("POST /signup rejects invalid payload before reaching register service", async () => {
    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/signup",
      body: {
        firstName: "",
        email: "bad-email",
      },
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
    });
    expect(register_Service).not.toHaveBeenCalled();
  });

  test("POST /signup accepts valid payload and reaches register service", async () => {
    register_Service.mockImplementation(async (req, res) => {
      res.status(201).json({
        success: true,
        email: req.body.email,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/signup",
      body: {
        firstName: "Asha",
        lastName: "Rao",
        email: "ASHA@EXAMPLE.COM",
        password: "secret1",
        role: "client",
      },
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      email: "ASHA@EXAMPLE.COM",
    });
    expect(register_Service).toHaveBeenCalledTimes(1);
  });

  test("POST /login validates credentials payload and reaches login service", async () => {
    login_Service.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        email: req.body.email,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/login",
      body: {
        email: "asha@example.com",
        password: "secret1",
        role: "client",
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      email: "asha@example.com",
    });
    expect(login_Service).toHaveBeenCalledTimes(1);
  });

  test("POST /sendverificationemail validates email and reaches verification mail service", async () => {
    emailVerification_Service.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        email: req.body.email,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/sendverificationemail",
      body: {
        email: "asha@example.com",
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      email: "asha@example.com",
    });
    expect(emailVerification_Service).toHaveBeenCalledTimes(1);
  });

  test("POST /verifyemail accepts email verification bearer token and reaches service", async () => {
    jwt.verify.mockReturnValue({
      id: userId,
      type: "email_verify",
    });
    emailVerify_Service.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        userId: req.userId,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/verifyemail",
      headers: {
        authorization: "Bearer email-token",
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userId,
    });
    expect(emailVerify_Service).toHaveBeenCalledTimes(1);
  });

  test("GET /allsecuritieslist returns grouped cached securities", async () => {
    get_NAMEIDMAP.mockReturnValue({
      INDEX: "asset-class-index-id",
      ETF: "asset-class-etf-id",
      "MUTUAL FUND": "asset-class-mf-id",
      BOND: "asset-class-bond-id",
    });

    get_AssetMetaDataName.mockReturnValue({
      "NIFTY 50": {
        _id: "security-index-id",
        assetClass: {
          toString: () => "asset-class-index-id",
        },
      },
      NIFTYBEES: {
        _id: "security-etf-id",
        assetClass: {
          toString: () => "asset-class-etf-id",
        },
      },
    });

    const response = await requestJson({
      baseUrl,
      path: "/allsecuritieslist",
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "All Securities List",
      data: {
        INDEX: {
          "NIFTY 50": "security-index-id",
        },
        ETF: {
          NIFTYBEES: "security-etf-id",
        },
        "MUTUAL FUND": {},
        BOND: {},
        "TRADABLE SECURITIES": {
          NIFTYBEES: "security-etf-id",
        },
      },
    });
  });

  test("GET /analytic/xirr/group/:groupId rejects invalid ObjectId before auth", async () => {
    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/analytic/xirr/group/not-an-object-id",
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid Request ID",
    });
    expect(jwt.verify).not.toHaveBeenCalled();
  });

  test("GET /userdetails rejects missing access token", async () => {
    const response = await requestJson({
      baseUrl,
      path: "/userdetails",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Unauthorized",
    });
    expect(Read_UserDetails_Service).not.toHaveBeenCalled();
  });

  test("GET /userdetails accepts valid access token and reaches user service", async () => {
    const headers = mockValidAccessToken();

    Read_UserDetails_Service.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        userId: req.userId,
        sessionDocId: req.sessionDocId,
      });
    });

    const response = await requestJson({
      baseUrl,
      path: "/userdetails",
      headers,
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userId,
      sessionDocId,
    });
    expect(SESSION_MODEL.findOne).toHaveBeenCalledWith({
      _id: sessionDocId,
      userId,
      revoke: false,
      expiresAt: { $gt: expect.any(Date) },
    });
    expect(Read_UserDetails_Service).toHaveBeenCalledTimes(1);
  });

  test("POST /refreshtoken rejects missing refresh cookies before service", async () => {
    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/refreshtoken",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      message: "Credentials missing",
    });
    expect(accessTokenRotation_Service).not.toHaveBeenCalled();
  });

  test("POST /refreshtoken accepts valid refresh cookies and reaches rotation service", async () => {
    jwt.verify.mockReturnValue({
      id: userId,
      sessionId: "session-id",
    });
    SESSION_MODEL.findOne.mockResolvedValue({
      _id: sessionDocId,
      sessionId: "session-id",
    });
    accessTokenRotation_Service.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        userId: req.userId,
        sessionId: req.sessionId,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/refreshtoken",
      headers: {
        cookie: "refreshToken=refresh-token; sessionId=session-id",
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userId,
      sessionId: "session-id",
    });
    expect(accessTokenRotation_Service).toHaveBeenCalledTimes(1);
  });

  test("POST /logoutuser and /logoutalluser require access token and reach logout services", async () => {
    logoutUser_Service.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        scope: "current",
        userId: req.userId,
      });
    });
    logoutAllUser_Service.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        scope: "all",
        userId: req.userId,
      });
    });

    const logoutOne = await requestJson({
      baseUrl,
      method: "POST",
      path: "/logoutuser",
      headers: mockValidAccessToken(),
    });
    const logoutAll = await requestJson({
      baseUrl,
      method: "POST",
      path: "/logoutalluser",
      headers: mockValidAccessToken(),
    });

    expect(logoutOne.status).toBe(200);
    expect(logoutOne.body).toEqual({
      success: true,
      scope: "current",
      userId,
    });
    expect(logoutAll.status).toBe(200);
    expect(logoutAll.body).toEqual({
      success: true,
      scope: "all",
      userId,
    });
    expect(logoutUser_Service).toHaveBeenCalledTimes(1);
    expect(logoutAllUser_Service).toHaveBeenCalledTimes(1);
  });

  test("password reset routes validate inputs and reach reset services", async () => {
    forgotPassword_Service.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, email: req.body.email });
    });
    verifyOtp_Service.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, otp: req.body.otp });
    });
    confirmPassword_Service.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, email: req.params.email });
    });

    const forgot = await requestJson({
      baseUrl,
      method: "POST",
      path: "/forgotpassword",
      body: { email: "asha@example.com" },
    });
    const verifyOtp = await requestJson({
      baseUrl,
      method: "POST",
      path: "/verifyotp/asha@example.com",
      body: { otp: "123456" },
    });
    const confirm = await requestJson({
      baseUrl,
      method: "POST",
      path: "/confirmpassword/asha@example.com",
      body: {
        newPassword: "secret1",
        confirmPassword: "secret1",
      },
    });

    expect(forgot.status).toBe(200);
    expect(verifyOtp.status).toBe(200);
    expect(confirm.status).toBe(200);
    expect(forgotPassword_Service).toHaveBeenCalledTimes(1);
    expect(verifyOtp_Service).toHaveBeenCalledTimes(1);
    expect(confirmPassword_Service).toHaveBeenCalledTimes(1);
  });

  test("POST /portfolio/holdings reaches holdings controller with valid token", async () => {
    fetch_UserHoldings.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        userId: req.userId,
        groupId: req.body.groupId,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/portfolio/holdings",
      headers: mockValidAccessToken(),
      body: { groupId },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userId,
      groupId,
    });
    expect(fetch_UserHoldings).toHaveBeenCalledTimes(1);
  });

  test("POST /portfolio/rebalancer/new validates payload before create controller", async () => {
    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/portfolio/rebalancer/new",
      headers: mockValidAccessToken(),
      body: {
        portfolioGroupId: groupId,
        sipAmount: 500,
        rebalancerName: "A",
        assets: [],
      },
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      success: false,
    });
    expect(createRebalancer).not.toHaveBeenCalled();
  });

  test("POST /portfolio/rebalancer/new reaches create controller with valid payload", async () => {
    createRebalancer.mockImplementation(async (req, res) => {
      res.status(201).json({
        success: true,
        sipAmount: req.body.sipAmount,
        userId: req.userId,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/portfolio/rebalancer/new",
      headers: mockValidAccessToken(),
      body: {
        portfolioGroupId: groupId,
        sipAmount: 5000,
        rebalancerName: "Core SIP",
        assets: [
          {
            assetId,
            groupId,
            targetWeight: 80,
            band: 5,
          },
          {
            assetId: "64f000000000000000000007",
            groupId,
            targetWeight: 20,
            band: 2,
            isCashReserve: true,
          },
        ],
        marketFallRules: [
          {
            fallPercentage: 10,
            deployPercentage: 25,
            assets: [{ assetId }],
          },
        ],
      },
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      sipAmount: 5000,
      userId,
    });
    expect(createRebalancer).toHaveBeenCalledTimes(1);
  });

  test("GET /portfolio/rebalancer/list reaches list controller with valid token", async () => {
    fetchRebalancerList.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        userId: req.userId,
      });
    });

    const response = await requestJson({
      baseUrl,
      path: "/portfolio/rebalancer/list",
      headers: mockValidAccessToken(),
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userId,
    });
    expect(fetchRebalancerList).toHaveBeenCalledTimes(1);
  });

  test("GET /portfolio/rebalancer/:id validates id before auth", async () => {
    const response = await requestJson({
      baseUrl,
      path: "/portfolio/rebalancer/not-an-id",
      headers: mockValidAccessToken(),
    });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Invalid Request ID",
    });
    expect(fetchRebalancerById).not.toHaveBeenCalled();
  });

  test("GET /portfolio/rebalancer/:id reaches detail controller with valid token", async () => {
    fetchRebalancerById.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        rebalancerId: req.params.rebalancerId,
        userId: req.userId,
      });
    });

    const response = await requestJson({
      baseUrl,
      path: `/portfolio/rebalancer/${rebalancerId}`,
      headers: mockValidAccessToken(),
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      rebalancerId,
      userId,
    });
  });

  test("POST /portfolio/:pg_id/trade/:a_id validates trade payload and reaches controller", async () => {
    trade.mockImplementation(async (req, res) => {
      res.status(200).json({
        success: true,
        type: req.body.type,
        userId: req.userId,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: `/portfolio/${groupId}/trade/${assetId}`,
      headers: mockValidAccessToken(),
      body: {
        type: "buy",
        date: "2026-06-29T10:00:00.000Z",
        qty: 2,
        price: 100,
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      type: "buy",
      userId,
    });
    expect(trade).toHaveBeenCalledTimes(1);
  });

  test("POST /portfolio/:pg_id/grouptransaction validates deposit and reaches controller", async () => {
    groupstatementTransaction.mockImplementation(async (req, res) => {
      res.status(201).json({
        success: true,
        type: req.body.type,
        userId: req.userId,
      });
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: `/portfolio/${groupId}/grouptransaction`,
      headers: mockValidAccessToken(),
      body: {
        type: "deposit",
        date: "2026-06-29T10:00:00.000Z",
        amount: 5000,
      },
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      type: "deposit",
      userId,
    });
    expect(groupstatementTransaction).toHaveBeenCalledTimes(1);
  });

  test("analytics routes reach public and protected analytic controllers", async () => {
    priceSecurityDrawdownAnalytic.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, securityId: req.params.securityId });
    });
    priceGroupDrawdownAnalytic.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, groupId: req.params.groupId });
    });
    xirrAnalytic.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, groupId: req.params.groupId });
    });
    xirrComparison.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, indexId: req.params.indexId });
    });
    navComparison.mockImplementation(async (req, res) => {
      res.status(200).json({ success: true, indexId: req.params.indexId });
    });

    const securityDrawdown = await requestJson({
      baseUrl,
      path: `/analytic/drawdown/security/${assetId}`,
    });
    const groupDrawdown = await requestJson({
      baseUrl,
      path: `/analytic/drawdown/group/${groupId}`,
      headers: mockValidAccessToken(),
    });
    const groupXirr = await requestJson({
      baseUrl,
      method: "POST",
      path: `/analytic/xirr/group/${groupId}`,
      headers: mockValidAccessToken(),
    });
    const compareXirr = await requestJson({
      baseUrl,
      path: `/analytic/comparision/xirr/${groupId}/${indexId}`,
      headers: mockValidAccessToken(),
    });
    const compareNav = await requestJson({
      baseUrl,
      path: `/analytic/comparision/nav/${groupId}/${indexId}`,
      headers: mockValidAccessToken(),
    });

    expect(securityDrawdown.status).toBe(200);
    expect(groupDrawdown.status).toBe(200);
    expect(groupXirr.status).toBe(200);
    expect(compareXirr.status).toBe(200);
    expect(compareNav.status).toBe(200);
    expect(priceSecurityDrawdownAnalytic).toHaveBeenCalledTimes(1);
    expect(priceGroupDrawdownAnalytic).toHaveBeenCalledTimes(1);
    expect(xirrAnalytic).toHaveBeenCalledTimes(1);
    expect(xirrComparison).toHaveBeenCalledTimes(1);
    expect(navComparison).toHaveBeenCalledTimes(1);
  });

  test("error middleware serializes errors from route handlers", async () => {
    register_Service.mockImplementation(async () => {
      throw new customError("Registration failed", 409);
    });

    const response = await requestJson({
      baseUrl,
      method: "POST",
      path: "/signup",
      body: {
        firstName: "Asha",
        lastName: "Rao",
        email: "asha@example.com",
        password: "secret1",
        role: "client",
      },
    });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      success: false,
      statusCode: 409,
      message: "Registration failed",
    });
  });
});
