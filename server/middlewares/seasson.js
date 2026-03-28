const session = require("express-session");
const MongoStore = require("connect-mongo");
const log = require("../utils/shared_Utils/console_loggers/consoleLoggers");

function sessionConfig(app) {
  store = MongoStore.create({
    mongoUrl: process.env.DB_URL,
    crypto: {
      secret: process.env.SESSION_SECRET,
    },
    touchAfter: 24 * 3600,
  });

  store.on("error", () => {
    log.error("MONGO SESSON STORE", err);
  });

  const sessionOptions = {
    store,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    },
  };
  app.use(session(sessionOptions));
  log.success("SESSION CONNECTED WITH MONGODB");
}

module.exports = sessionConfig;
