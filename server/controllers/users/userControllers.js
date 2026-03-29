const userModel = require("../../models/users_Models/user");
const PortfolioGroup_Model = require("../../models/Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const passport = require("passport");

module.exports.register_NewUser = async (req, res, next) => {
  try {
    const { newUser, password } = req.body;
    const new_user = await userModel.register(new userModel(newUser), password);

    await PortfolioGroup_Model.create({
      name: "NET PORTFOLIO",
      parentId: null,
      description: "Top level default Group",
      level:1,
      userId: new_user._id,
    });

    req.login(new_user, async (err) => {
      if (err) return next();
      return res.status(200).json({
        success: "Login successful",
      });
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports.login_User = async (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(400).json({ error: info?.message || "Login failed" });

    req.login(user, async (err) => {
      if (err) return next(err);
      return res.status(200).json({
        success: "Login successful",
      });
    });
  })(req, res, next);
};

module.exports.logout_User = async (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.status(200).json({ success: "LogOut successful" });
  });
};

module.exports.isLogedIn = async (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.status(200).json({
      authenticated: true,
    });
  } else {
    res.json({ authenticated: false });
  }
};
