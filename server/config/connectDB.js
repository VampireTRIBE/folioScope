if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const log = require("../utils/console_loggers/consoleLoggers");

async function DB_connect() {
  try {
    mongoose.connect(process.env.DB_URL);
    log.success("DATABASE CONNECTION SUCCESSFUL");
  } catch (err) {
    log.error("DATABASE CONNECTION FAILED");
  }
}

module.exports = DB_connect;
