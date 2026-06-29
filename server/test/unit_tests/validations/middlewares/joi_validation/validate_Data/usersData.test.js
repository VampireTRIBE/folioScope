// test/unit_tests/validations/middlewares/joi_validation/validate_Data/usersData.test.js

const {
  validate_RegisterData,
  validate_loginDATA,
  validate_email,
  validate_otp,
  validate_ChangePasswordDATA,
} = require("../../../../../../utils/validations/middlewares/joi_validation/validate_Data/usersData");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

const expectValidationPasses = (middleware, body) => {
  const req = { body };
  const res = createResponse();
  const next = jest.fn();

  middleware(req, res, next);

  expect(next).toHaveBeenCalledTimes(1);
  expect(res.status).not.toHaveBeenCalled();
};

const expectValidationFails = (middleware, body) => {
  const req = { body };
  const res = createResponse();
  const next = jest.fn();

  middleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(400);
  expect(next).not.toHaveBeenCalled();
  expect(res.json).toHaveBeenCalled();
};

describe("usersData Joi middleware", () => {
  test("validates register payload", () => {
    expectValidationPasses(validate_RegisterData, {
      firstName: "Asha",
      lastName: "Rao",
      email: "asha@example.com",
      password: "secret1",
      role: "client",
    });
  });

  test("rejects invalid register payload", () => {
    expectValidationFails(validate_RegisterData, {
      firstName: "",
    });
  });

  test("validates login payload", () => {
    expectValidationPasses(validate_loginDATA, {
      email: "asha@example.com",
      password: "secret1",
      role: "client",
    });
  });

  test("validates email payload", () => {
    expectValidationPasses(validate_email, {
      email: "asha@example.com",
    });
  });

  test("validates otp payload", () => {
    expectValidationPasses(validate_otp, {
      otp: "123456",
    });
  });

  test("rejects otp with wrong length", () => {
    expectValidationFails(validate_otp, {
      otp: "123",
    });
  });

  test("validates change-password payload", () => {
    expectValidationPasses(validate_ChangePasswordDATA, {
      newPassword: "secret1",
      confirmPassword: "secret1",
    });
  });

  test("rejects change-password mismatch", () => {
    expectValidationFails(validate_ChangePasswordDATA, {
      newPassword: "secret1",
      confirmPassword: "different",
    });
  });
});
