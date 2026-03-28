const userModel = require("../../models/usersModels/user");
const passport = require("passport");

const usersControllers = {
  async registerUser(req, res, next) {
    try {
      const { newUser, password } = req.body;
      const new_user = await userModel.register(new userModel(newUser), password);

      req.login(new_user, async (err) => {
        if (err) return next();
        return res.status(200).json({
          success: "Login successful",
        });
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  },

  async loginUser(req, res, next) {
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
  },

  async logoutUser(req, res, next) {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.status(200).json({ success: "LogOut successful" });
    });
  },

  async isLogedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return res.status(200).json({
        authenticated: true,
      });
    } else {
      res.json({ authenticated: false });
    }
  },
};

module.exports = usersControllers;
