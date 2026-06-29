const dotenv = require("dotenv");
dotenv.config({ quiet: true });

// ! IMPORTANT IMPORTS

const { DB_connect } = require("./config/connectDB");
const { createApp } = require("./app");

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

const app = createApp();

const startServer = () => {
  DB_connect();
  registerModels();

  // ! for listning all requests
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, (err) => {
    err
      ? log.error("ERROR : ", err)
      : log.running(`Server running at http://localhost:${PORT}`);
  });

  // ! System Bootup
  (async function () {
    await systemBootup();
  })();

  // ! Update Live Price
  (async function () {
    await sync_CurrentPrices();
  })();

  // ! Update for all users
  (async function () {
    await sync_AllUsersPortfolio();
  })();

  return server;
};

if (require.main === module) {
  startServer();
}

module.exports = {
  app,
  startServer,
};
