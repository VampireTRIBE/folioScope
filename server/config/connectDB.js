const mongoose = require("mongoose");
const log = require("../utils/shared/console_Loggers/consoleLoggers");

module.exports.DB_connect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, { autoIndex: true });
    log.success("DATABASE CONNECTION SUCCESSFULL");
  } catch (err) {
    log.error("DATABASE CONNECTION FAILED");
    process.exit(1);
  }
};
