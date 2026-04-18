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
const {
  syncPortfolio,
  syncNavFutureGap,
} = require("./services/syncPortfolio/updatePortfolio");
const {
  getAllUserIds,
} = require("./utils/Portfolio_Models_utils/aggregationPipeline/getAll_userIds");
const {
  Fill_PastNAV_Redesign,
} = require("./services/syncPortfolio/fill_nav_GapV2");
const {
  get_LastNavDatesByUser,
} = require("./utils/Portfolio_Models_utils/aggregationPipeline/get_DataFromDatabase");

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

// ! System Bootup

(async function () {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));
  const runWithRetry = async (fn, label, maxRetries = 3) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fn();
        if (res?.result === false) {
          throw new Error(`${label} returned false`);
        }
        return res;
      } catch (error) {
        if (attempt < maxRetries) {
          await delay(500 * attempt);
        } else {
          throw new Error(
            `${label} failed after ${maxRetries} attempts: ${error.message}`,
          );
        }
      }
    }
  };

  try {
    // =========================
    // 1. INIT CACHE
    // =========================
    await runWithRetry(() => initCacheMaster(), "INIT CACHE");
    log.success("INIT CACHE SUCCESSFUL...");

    // =========================
    // 2. INIT APPSCRIPT
    // =========================
    // await runWithRetry(() => initAppscriptMaster(), "INIT APPSCRIPT");
    // log.success("INIT APPSCRIPT SUCCESSFUL...");

    // =========================
    // 3. UPDATE NAV
    // =========================
    const [userIds, userNavMap] = await Promise.all([
      getAllUserIds(),
      get_LastNavDatesByUser(),
    ]);
    if (!userIds.length) {
      log.error("No UserId Found...");
      log.success("BOOTSTRAP COMPLETED SUCCESSFULLY");
      return;
    }
    const BATCH_SIZE = 10;
    const MAX_RETRIES = 3;
    const retryUpdate = async (userId, attempt = 1) => {
      try {
        await syncNavFutureGap(
          userId,
          userNavMap[userId].lastNavDate,
          new Date(),
        );
        return { userId, success: true };
      } catch (error) {
        if (attempt < MAX_RETRIES) {
          await delay(300 * attempt);
          return retryUpdate(userId, attempt + 1);
        }
        return { userId, success: false, error };
      }
    };
    let success = 0;
    let failed = [];
    for (let i = 0; i < userIds.length; i += BATCH_SIZE) {
      const batch = userIds.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map((userId) => retryUpdate(userId)),
      );
      results.forEach((r) => {
        if (r.success) success++;
        else failed.push(r);
      });
    }
    if (failed.length > 0) {
      failed.forEach((f) =>
        log.error(`Failed userId: ${f.userId}, error: ${f.error?.message}`),
      );
      throw new Error(
        `NAV UPDATE FAILED: ${failed.length} users failed, ${success} succeeded`,
      );
    }
    log.success("Past Nav Update successful for all users");

    // =========================
    // DONE
    // =========================
    log.success("BOOTSTRAP COMPLETED SUCCESSFULLY");
  } catch (err) {
    console.error("FATAL ERROR:", err.message);
  }
})();

// ! Update Live Price And Sync Portfolio

const TIME_INTERVEL = 3 * 60 * 1000;
// const init_FetchCurrentPrice = async () => {
//   await fetchCurrentPrice();
//   setTimeout(init_FetchCurrentPrice, TIME_INTERVEL);
// };
// setTimeout(init_FetchCurrentPrice, TIME_INTERVEL);

const init_PortfolioSync = async () => {
  const [userIds, userNavMap] = await Promise.all([
    getAllUserIds(),
    get_LastNavDatesByUser(),
  ]);
  for (const userId of userIds) {
    await syncNavFutureGap(userId, userNavMap[userId].lastNavDate, new Date());
    await syncPortfolio(userId);
  }
  setTimeout(init_PortfolioSync, TIME_INTERVEL + 60000);
};
setTimeout(init_PortfolioSync, TIME_INTERVEL + 60000);

app.use("/test", async (req, res) => {
  const leafGroupIds = await get_LastNavDatesByUser();
  res.status(200).json({
    success: "successful",
    data: leafGroupIds,
  });
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
