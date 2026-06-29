// test/unit_tests/validations/contentValidator/validateEmail.test.js

const {
  validateParamsEmail,
} = require("../../../../utils/validations/contentValidator/validateEmail");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("validateParamsEmail", () => {
  test("normalizes a valid email parameter and calls next", async () => {
    const req = {
      params: {
        email: "  USER@Example.COM  ",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    await validateParamsEmail()(req, res, next);

    expect(req.params.email).toBe("user@example.com");
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("supports a custom email parameter name", async () => {
    const req = {
      params: {
        ownerEmail: "owner@example.com",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    await validateParamsEmail("ownerEmail")(req, res, next);

    expect(req.params.ownerEmail).toBe("owner@example.com");
    expect(next).toHaveBeenCalledTimes(1);
  });

  test("returns 400 when email is missing", async () => {
    const req = {
      params: {},
    };
    const res = createResponse();
    const next = jest.fn();

    await validateParamsEmail()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Request EMAIL",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 400 when email format is invalid", async () => {
    const req = {
      params: {
        email: "invalid-email",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    await validateParamsEmail()(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid Email Format",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
