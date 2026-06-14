// ! Models
const USER_MODEL = require("../../../../models/Users_Models/user");

// ! Utils
const {
  find_validate_user,
} = require("../../../../utils/mongodb/aggregations/readModels/read_Auth_Models/validate_User");
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

    return res.status(200).json({
      success: true,
      message: "User Data.",
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};
