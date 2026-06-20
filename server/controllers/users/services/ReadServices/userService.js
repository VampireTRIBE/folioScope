// ! Models
const USER_MODEL = require("../../../../models/Users_Models/user");

// ! Utils
const {
  get_AllLeafNodes,
} = require("../../../../utils/mongodb/aggregations/get_LeafNodes");
const {
  find_validate_user,
} = require("../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
const {
  find_AllPortfolioGroups_BY_Level,
} = require("../../../../utils/mongodb/aggregations/readModels/read_PortfolioGroup_Models/read_PortfolioGroupIDsBylevel");
const customError = require("../../../../utils/shared/error/customError");

module.exports.Read_UserDetails_Service = async (req, res, next) => {
  try {
    const userID = req.userId;
    const sessionDocID = req.sessionDocId;
    const sessionDoc = req.sessionDoc;

    const filterObj = {
      _id: userID,
    };

    const user = await find_validate_user({ filterObj });
    if (!user.isVerified) {
      throw new customError("VERIFYEMAIL", 400);
    }

    // find Users portolio Groups

    const filterObjLevel1 = { userId: userID, level: 1 };
    const filterObjLevel2 = { userId: userID, level: 2 };
    const filterObjLevel3 = { userId: userID, level: 3 };
    const filterObjLevel4 = { userId: userID, level: 4 };

    const LeafGroupIDs = await get_AllLeafNodes(userID);
    let LeafGroupIDsOBJ = {};
    for (const el of LeafGroupIDs) {
      LeafGroupIDsOBJ[el] = "TRUE";
    }

    const [level1_Groups, level2_Groups, level3_Groups, level4_Groups] =
      await Promise.all([
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel1,
          LeafGroupIDsOBJ,
        }),
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel2,
          LeafGroupIDsOBJ,
        }),
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel3,
          LeafGroupIDsOBJ,
        }),
        find_AllPortfolioGroups_BY_Level({
          filterObj: filterObjLevel4,
          LeafGroupIDsOBJ,
        }),
      ]);

    return res.status(200).json({
      success: true,
      message: "User Data.",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        groups: {
          level1: level1_Groups,
          level2: level2_Groups,
          level3: level3_Groups,
          level4: level4_Groups,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
