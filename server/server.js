if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

const express = require("express");
const corAuth = require("./middlewares/cors");
const DB_connect = require("./config/connectDB");
const passportAuth = require("./middlewares/authentication");
const sessionConfig = require("./middlewares/seasson");
const dataParser = require("./middlewares/dataParser");
const log = require("./utils/shared_Utils/console_loggers/consoleLoggers");
const {
  initCacheMaster,
} = require("./init_Scripts/init_Cache/AssetsData_Models_Cache/Init_masterCache");
const {
  initAppscriptMaster,
} = require("./init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_masterAppscript");
const {
  fetchCurrentPrice,
} = require("./init_Scripts/init_Appscript/AssetsData_Models_Scripts/init_appscriptFiles/fetch_CurrentPriceScript");
const { syncPortfolio } = require("./services/syncPortfolio/updatePortfolio");

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
const portfolioRoute = require("./routes/portfolioRoutes/portfolioRoutes");

// ! for listning all requests
app.listen(port, async (req, res) => {
  log.running(`SERVER PORT : ${port}`);
});

(async function () {
  // ! init Cache
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

const TIME_INTERVEL = 5*60*1000;
const init_FetchCurrentPrice = async () => {
  await fetchCurrentPrice();
  setTimeout(init_FetchCurrentPrice, TIME_INTERVEL);
};
setTimeout(init_FetchCurrentPrice, TIME_INTERVEL);

const init_PortfolioSync = async () => {
  await syncPortfolio();
  setTimeout(init_PortfolioSync, TIME_INTERVEL);
};
setTimeout(init_PortfolioSync, TIME_INTERVEL);

app.use("/test", async (req, res) => {
  // const leafGroupIds = await getLeafNodes(req.user._id);
  // const result = await updatePortfolioGroupTree(leafGroupIds, req.user._id);
  // res.status(200).json({
  //   success: "successful",
  //   leafGroupIds,
  //   result,
  // });
});

// ! Diffrent Routes

// ! login/signup Routes
app.use("/", userRoute);

// ! Admin Routes
app.use("/admin/dataseeders", adminRoute);

// ! Portfolio Routes
app.use("/portfolio", portfolioRoute);

// ! error handling middleware
app.use((err, req, res, next) => {
  const { status = 500, message = "Some Error" } = err;
  console.log(`Status Code : ${status}\nMessage : ${message}`);
  res.send(`Status : ${status}\nMessage : ${message}`);
});
