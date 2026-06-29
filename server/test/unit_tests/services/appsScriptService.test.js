// test/unit_tests/services/appsScriptService.test.js

jest.mock("axios", () => ({
  post: jest.fn(),
}));

const axios = require("axios");
const {
  callAppsScript,
} = require("../../../services/appsScript/appsScriptService");

describe("callAppsScript", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("posts api key, action, and data to Apps Script endpoint", async () => {
    axios.post.mockResolvedValue({
      data: { success: true, rows: [{ symbol: "ABC" }] },
    });

    const result = await callAppsScript(
      "https://script.google.com/macros/s/app-id/exec",
      "secret-key",
      "GET_PRICES",
      { symbols: ["ABC"] },
    );

    expect(axios.post).toHaveBeenCalledWith(
      "https://script.google.com/macros/s/app-id/exec",
      {
        apiKey: "secret-key",
        action: "GET_PRICES",
        data: { symbols: ["ABC"] },
      },
    );
    expect(result).toEqual({ success: true, rows: [{ symbol: "ABC" }] });
  });

  test("converts Apps Script error payload into custom error", async () => {
    axios.post.mockResolvedValue({
      data: { error: "Invalid api key" },
    });

    await expect(
      callAppsScript("url", "bad-key", "GET_PRICES"),
    ).rejects.toMatchObject({
      message: "Invalid api key",
      statusCode: 500,
    });
  });

  test("uses HTTP response error details and status when request fails", async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 403,
        data: {
          details: "Forbidden by Apps Script",
        },
      },
    });

    await expect(
      callAppsScript("url", "bad-key", "GET_PRICES"),
    ).rejects.toMatchObject({
      message: "Forbidden by Apps Script",
      statusCode: 403,
    });
  });
});
