if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const corAuth = require("./middlewares/cors");
const DB_connect = require("./config/connectDB");
const passportAuth = require("./middlewares/authentication");
const sessionConfig = require("./middlewares/seasson");
const dataParser = require("./middlewares/dataParser");
const log = require("./utils/console_loggers/consoleLoggers");
const { initCacheMaster } = require("./middlewares/initCache");
const { initAppscriptMaster } = require("./middlewares/initAppscript");
const app = express();
let port = 3000;

corAuth.corAuth(app);
DB_connect();
sessionConfig(app);
passportAuth(app);
dataParser.bodyParser(app);

// !import routes
const userRoute = require("./routes/userRoutes/userRoute");
const adminRoute = require("./routes/adminRoutes/adminRoutes");

// ! for listning all requests
app.listen(port, async (req, res) => {
  log.running(`SERVER PORT : ${port}`);
});

// ! init Cache
(async function () {
  const { result } = await initCacheMaster();
  result
    ? log.success("INIT CACHE SUCCESSFUL...")
    : log.error("INIT CACHE FAILED...");

  // ! INIT APPSCRIPT SERVICES
  (async function () {
    const { result } = await initAppscriptMaster();
    result
      ? log.success("INIT APPSCRIPT SUCCESSFUL...")
      : log.error("INIT APPSCRIPT FAILED...");
  })();
})();

app.use("/test", async (req, res) => {
  const result = await initLivePrice();
  res.status(200).json({
    success: "successful",
    result,
  });
});

// ! Diffrent Routes

app.use("/", userRoute);

// ! Admin Routes
app.use("/admin/dataseeders", adminRoute);

// ! error handling middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Some Error" } = err;
  console.log(`Status Code : ${status}\nMessage : ${message}`);
  res.send(`Status : ${status}\nMessage : ${message}`);
});
