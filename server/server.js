if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

// ! IMPORTANT IMPORTS

const express = require("express");
const corAuth = require("./middlewares/cors");
const DB_connect = require("./config/connectDB");
const passportAuth = require("./middlewares/authentication");
const sessionConfig = require("./middlewares/seasson");
const dataParser = require("./middlewares/dataParser");
const log = require("./utils/shared/console_Loggers/consoleLoggers");
const { systemBootup } = require("./sync_System/SystemBootup");

const app = express();

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
app.listen(process.env.PORT, async (req, res) => {
  log.running(`SERVER PORT : ${process.env.PORT}`);
});

// ! System Bootup

(async function () {
  await systemBootup();
})();

// ! Update Live Price And Sync Portfolio

app.use("/test", async (req, res) => {
  // const pastcloses = await getPastClosePrices(
  //   new Date("2026-04-01T06:41:00.000Z"),
  //   new Date(),
  // );
  // const UserGroups = await userGroups("69e68cadb35fcabe7919cffd");
  // const groupsStatements = await groupStatement("69e68cadb35fcabe7919cffd");
  // const holdings = await financialAsset("69e68cadb35fcabe7919cffd");
  // const ledgerStatements = await ledgerStatement("69e68cadb35fcabe7919cffd");
  // const fifoLots = await fifoLot("69e68cadb35fcabe7919cffd");
  // const groupsNav = await navPerformence("69e68cadb35fcabe7919cffd");

  try {
    const result1 = await defaultNavComparison({
      indexId: "69dbfdf6a3e43f9891606210",
      groupId: "69eb6f19f9a45a2a35372785",
      startDate: new Date("2026-03-01T06:37:00.000Z"),
    });
    const result2 = await defaultXirrComparision(
      "69eb6f19f9a45a2a35372785",
      "69eb6f19f9a45a2a35372782",
      "69dbfdf6a3e43f9891606210",
    );
    res.status(200).json({
      success: "successful",
      result: { result1, result2 },
    });
  } catch (error) {
    console.log(error);
    res.send("error");
  }
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
