// test/unit_tests/authentication/authUtils.test.js

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");

const {
  hashPassword,
  generateJWTToken,
  hashRefreshToken,
} = require("../../../utils/authentication/authUtils");

describe("authUtils", () => {
  const originalJwtSecret = process.env.JWT_SECRET;

  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret";
  });

  afterEach(() => {
    process.env.JWT_SECRET = originalJwtSecret;
  });

  test("hashPassword creates a bcrypt hash that validates the original password", async () => {
    const password = "S3cure#Password";

    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/);
    await expect(bcrypt.compare(password, hash)).resolves.toBe(true);
    await expect(bcrypt.compare("wrong-password", hash)).resolves.toBe(false);
  });

  test("generateJWTToken signs payload with configured secret and expiry", () => {
    const token = generateJWTToken({ userId: "user-1", role: "admin" }, "15m");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded).toMatchObject({
      userId: "user-1",
      role: "admin",
    });

    expect(decoded.exp - decoded.iat).toBe(15 * 60);
  });

  test("hashRefreshToken creates a deterministic sha256 token hash", () => {
    const token = "refresh-token-value";

    const result = hashRefreshToken(token);

    expect(result).toBe(
      crypto.createHash("sha256").update(token).digest("hex"),
    );
    expect(result).toMatch(/^[a-f0-9]{64}$/);
  });
});
