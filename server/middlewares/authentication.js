const passport = require("passport");
const userModel = require("../models/users models/user");
const localStrategy = require("passport-local");

async function passportAuthentication(app) {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.use(new localStrategy(userModel.authenticate()));
  passport.serializeUser(userModel.serializeUser());
  passport.deserializeUser(userModel.deserializeUser());
}
module.exports = passportAuthentication;
