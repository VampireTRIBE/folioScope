const express = require("express");
const log = require("../utils/shared/console_Loggers/consoleLoggers");
const customError = require("../utils/shared/error/customError");

module.exports.bodyParser = (app) => {
  try {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
  } catch (error) {
    log("Error in BodyParser Middleware");
    throw new customError("Server Error", 503);
  }
};
