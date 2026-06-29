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
} = require("../../controllers/users/services/authServices/loginService");

const {
  Read_UserDetails_Service,
} = require("../../controllers/users/services/ReadServices/userService");

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
    const sessionDoc = {
      _id: "64f000000000000000000002",
    };

    jwt.verify.mockReturnValue({
      id: "64f000000000000000000001",
      sessionDocId: "64f000000000000000000002",
    });

    SESSION_MODEL.findOne.mockResolvedValue(sessionDoc);

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
      headers: {
        authorization: "Bearer access-token",
      },
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      userId: "64f000000000000000000001",
      sessionDocId: "64f000000000000000000002",
    });
    expect(SESSION_MODEL.findOne).toHaveBeenCalledWith({
      _id: "64f000000000000000000002",
      userId: "64f000000000000000000001",
      revoke: false,
      expiresAt: { $gt: expect.any(Date) },
    });
    expect(Read_UserDetails_Service).toHaveBeenCalledTimes(1);
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
