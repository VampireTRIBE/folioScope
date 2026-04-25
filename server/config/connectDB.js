if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const mongoose = require("mongoose");
const log = require("../utils/shared/console_Loggers/consoleLoggers");

async function DB_connect() {
  try {
    mongoose.connect(process.env.DB_URL, { autoIndex: true });
    log.success("DATABASE CONNECTION SUCCESSFULL");
  } catch (err) {
    log.error("DATABASE CONNECTION FAILED");
  }
}

module.exports = DB_connect;
