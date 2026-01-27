const express = require("express");
const methodOverride = require("method-override");

const dataParsers = {
  bodyParser(app) {
    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(methodOverride("_method"));
  },
};

module.exports = dataParsers;
