const express = require("express");

const { corAuth } = require("./middlewares/cors");
const { cookieParser } = require("./middlewares/cookieParser");
const { bodyParser } = require("./middlewares/dataParser");

const publicRoute = require("./routes/publicRoutes/publicRoutes");
const analyticsRoute = require("./routes/analyticsRoutes/priceAnalyticRoutes");
const priceRangeRoute = require("./routes/priceRoutes/priceRoutes");
const userRoute = require("./routes/userRoutes/userRoute");
const adminRoute = require("./routes/adminRoutes/adminRoutes");
const portfolioRoute = require("./routes/portfolioRoutes/portfolioRoutes");
const testRoutes = require("./routes/testRoutes/testRoutes");

const createApp = ({ enableTestRoutes = false } = {}) => {
  const app = express();

  corAuth(app);
  cookieParser(app);
  bodyParser(app);

  if (enableTestRoutes) {
    app.use("/test", testRoutes);
  }

  app.use("/", userRoute);
  app.use("/", publicRoute);
  app.use("/price", priceRangeRoute);
  app.use("/analytic", analyticsRoute);
  app.use("/admin/dataseeders", adminRoute);
  app.use("/portfolio", portfolioRoute);

  app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Some Error" } = err;
    res.status(statusCode).json({
      success: false,
      statusCode,
      message,
    });
  });

  return app;
};

module.exports = {
  createApp,
};
