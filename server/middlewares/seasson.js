// const session = require("express-session");
// const MongoStore = require("connect-mongo");
// const log = require("../utils/shared/console_Loggers/consoleLoggers");

// module.exports.sessionConfig = (app) => {
//   store = MongoStore.create({
//     mongoUrl: process.env.DB_URL,
//     crypto: {
//       secret: process.env.SESSION_SECRET,
//     },
//     touchAfter: 24 * 3600,
//   });

//   store.on("error", () => {
//     log.error("MONGO SESSON STORE", err);
//     process.exit(1);
//   });

//   const sessionOptions = {
//     store,
//     secret: process.env.SESSION_SECRET,
//     resave: false,
//     saveUninitialized: true,
//     cookie: {
//       expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//       httpOnly: true,
//     },
//   };
//   app.use(session(sessionOptions));
//   log.success("SESSION CONNECTED WITH MONGODB");
// };
