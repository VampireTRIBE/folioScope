// test/unit_tests/validations/contentValidator/validateID.test.js

const { validateID } = require("../../../../utils/validations/contentValidator/validateID");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("validateID", () => {
  test("calls next for a valid ObjectId route parameter", async () => {
    const req = {
      params: {
        groupId: "64f000000000000000000001",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    await validateID("groupId")(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });

  test("returns 400 for a missing ObjectId parameter", async () => {
    const req = {
      params: {},
    };
    const res = createResponse();
    const next = jest.fn();

    await validateID("groupId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid Request ID",
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("returns 400 for a malformed ObjectId parameter", async () => {
    const req = {
      params: {
        groupId: "not-an-object-id",
      },
    };
    const res = createResponse();
    const next = jest.fn();

    await validateID("groupId")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Invalid Request ID",
    });
    expect(next).not.toHaveBeenCalled();
  });
});
