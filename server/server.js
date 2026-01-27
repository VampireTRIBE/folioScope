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
const app = express();
let port = 3000;

corAuth.corAuth(app);
DB_connect();
sessionConfig(app);
passportAuth(app);
dataParser.bodyParser(app);

// for listning all requests
app.listen(port, async () => {
  log.running(`SERVER PORT : ${port}`);
});

// Diffrent Routes

// error handling middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Some Error" } = err;
  console.log(`Status Code : ${status}\nMessage : ${message}`);
  res.send(`Status : ${status}\nMessage : ${message}`);
});
