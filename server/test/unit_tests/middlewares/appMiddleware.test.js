// test/unit_tests/middlewares/appMiddleware.test.js

jest.mock("cors", () => jest.fn((options) => ({ type: "cors", options })));

jest.mock("express", () => ({
  urlencoded: jest.fn((options) => ({ type: "urlencoded", options })),
  json: jest.fn(() => ({ type: "json" })),
}));

jest.mock("cookie-parser", () => jest.fn(() => ({ type: "cookie-parser" })));

const cors = require("cors");
const express = require("express");
const cookieParserLib = require("cookie-parser");

const { corAuth } = require("../../../middlewares/cors");
const { bodyParser } = require("../../../middlewares/dataParser");
const { cookieParser } = require("../../../middlewares/cookieParser");
const { cookieObj } = require("../../../utils/authentication/cookieObj");

describe("app middleware wiring", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("corAuth registers cors middleware with allowed origin rules", async () => {
    const app = {
      use: jest.fn(),
    };

    await corAuth(app);

    expect(cors).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith({
      type: "cors",
      options: expect.objectContaining({
        methods: "GET, POST, PUT, PATCH, DELETE",
        credentials: true,
      }),
    });

    const { origin } = cors.mock.calls[0][0];
    const allowCallback = jest.fn();
    const denyCallback = jest.fn();

    origin("http://localhost:5173", allowCallback);
    origin("https://evil.example.com", denyCallback);

    expect(allowCallback).toHaveBeenCalledWith(null, true);
    expect(denyCallback.mock.calls[0][0]).toMatchObject({
      message: "Not allowed by CORS",
      statusCode: 403,
    });
  });

  test("bodyParser registers urlencoded and json parsers", () => {
    const app = {
      use: jest.fn(),
    };

    bodyParser(app);

    expect(express.urlencoded).toHaveBeenCalledWith({ extended: true });
    expect(express.json).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenNthCalledWith(1, {
      type: "urlencoded",
      options: { extended: true },
    });
    expect(app.use).toHaveBeenNthCalledWith(2, { type: "json" });
  });

  test("cookieParser registers cookie-parser middleware", () => {
    const app = {
      use: jest.fn(),
    };

    cookieParser(app);

    expect(cookieParserLib).toHaveBeenCalledTimes(1);
    expect(app.use).toHaveBeenCalledWith({ type: "cookie-parser" });
  });

  test("cookieObj uses secure cross-site cookie defaults", () => {
    expect(cookieObj).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  });
});
