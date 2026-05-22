const cookie_Parser = require("cookie-parser");

module.exports.cookieParser = (app) => {
  app.use(cookie_Parser());
};
