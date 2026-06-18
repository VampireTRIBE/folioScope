const dotenv = require("dotenv");
dotenv.config({ quiet: true });

// ! IMPORTANT IMPORTS

const express = require("express");

// ! Middlewares
const { corAuth } = require("./middlewares/cors");
const { DB_connect } = require("./config/connectDB");
const { cookieParser } = require("./middlewares/cookieParser");
const { bodyParser } = require("./middlewares/dataParser");

// ! Console Logger
const log = require("./utils/shared/console_Loggers/consoleLoggers");

// ! System Bootup
const { systemBootup } = require("./sync_System/SystemBootup");

// ! Sync Scripts
const { sync_CurrentPrices } = require("./sync_System/sync_CurrentPrices");
const {
  sync_AllUsersPortfolio,
} = require("./sync_System/sync_AllusersPortfolio");

// ! Register Models
const { registerModels } = require("./models/index_models");

const app = express();

corAuth(app);
DB_connect();
cookieParser(app);
bodyParser(app);
registerModels();

// !import routes
const publicRoute = require("./routes/publicRoutes/publicRoutes");
const analyticsRoute = require("./routes/analyticsRoutes/priceAnalyticRoutes");
const priceRangeRoute = require("./routes/priceRoutes/priceRoutes");
const userRoute = require("./routes/userRoutes/userRoute");
const adminRoute = require("./routes/adminRoutes/adminRoutes");
const portfolioRoute = require("./routes/portfolioRoutes/portfolioRoutes");
const testRoutes = require("./routes/testRoutes/testRoutes");

// ! for listning all requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, (err) => {
  err
    ? log.error("ERROR : ", err)
    : log.running(`Server running at http://localhost:${PORT}`);
});

// ! System Bootup

(async function () {
  await systemBootup();
})();

// ! Update Live Price

// (async function () {
//   await sync_CurrentPrices();
// })();

// ! Update for all users
// (async function () {
//   await sync_AllUsersPortfolio();
// })();

// ! Only for Testing purpouse In Devlopment
app.use("/test", testRoutes);

// ! Diffrent Routes

// ! login/signup Routes
app.use("/", userRoute);

// ! Public Data View
app.use("/", publicRoute);

// ! Price Range Data View
app.use("/price", priceRangeRoute);

// ! Analytic Routes
app.use("/analytic", analyticsRoute);

// ! Admin Routes
app.use("/admin/dataseeders", adminRoute);

// ! Portfolio Routes
app.use("/portfolio", portfolioRoute);

// ! error handling middleware
app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Some Error" } = err;
  console.log(`Status Code : ${statusCode}\nMessage : ${message}`);
  res.status(statusCode).json({ success: false, statusCode, message: message });
});
