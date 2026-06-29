// test/unit_tests/users/services/userService.test.js

jest.mock("../../../../models/Users_Models/user", () => ({}));

jest.mock("../../../../utils/mongodb/aggregations/get_LeafNodes", () => ({
  get_AllLeafNodes: jest.fn(),
}));

jest.mock(
  "../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User",
  () => ({
    find_validate_user: jest.fn(),
  }),
);

jest.mock(
  "../../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroupIDsBylevel",
  () => ({
    find_AllPortfolioGroups_BY_Level: jest.fn(),
  }),
);

const {
  get_AllLeafNodes,
} = require("../../../../utils/mongodb/aggregations/get_LeafNodes");
const {
  find_validate_user,
} = require("../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const {
  find_AllPortfolioGroups_BY_Level,
} = require("../../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroupIDsBylevel");
const {
  Read_UserDetails_Service,
} = require("../../../../controllers/users/services/ReadServices/userService");

const createResponse = () => {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
};

describe("Read_UserDetails_Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns verified user details with level-wise portfolio groups", async () => {
    find_validate_user.mockResolvedValue({
      firstName: "Jane",
      lastName: "Client",
      role: "client",
      isVerified: true,
    });
    get_AllLeafNodes.mockResolvedValue(["leaf-1"]);
    find_AllPortfolioGroups_BY_Level
      .mockResolvedValueOnce([{ _id: "root", isLeaf: false }])
      .mockResolvedValueOnce([{ _id: "child", isLeaf: true }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);
    const res = createResponse();
    const next = jest.fn();

    await Read_UserDetails_Service({ userId: "user-id" }, res, next);

    expect(find_validate_user).toHaveBeenCalledWith({
      filterObj: { _id: "user-id" },
    });
    expect(find_AllPortfolioGroups_BY_Level).toHaveBeenCalledWith({
      filterObj: { userId: "user-id", level: 1 },
      LeafGroupIDsOBJ: { "leaf-1": "TRUE" },
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: "User Data.",
      user: {
        firstName: "Jane",
        lastName: "Client",
        role: "client",
        groups: {
          level1: [{ _id: "root", isLeaf: false }],
          level2: [{ _id: "child", isLeaf: true }],
          level3: [],
          level4: [],
        },
      },
    });
  });

  test("passes unverified users to error middleware", async () => {
    find_validate_user.mockResolvedValue({ isVerified: false });
    const next = jest.fn();

    await Read_UserDetails_Service({ userId: "user-id" }, createResponse(), next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "VERIFYEMAIL",
        statusCode: 400,
      }),
    );
  });
});
