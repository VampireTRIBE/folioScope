// ! USER MODELS
const USER_MODEL = require("./Users_Models/user");
const SESSION_MODEL = require("./Users_Models/session");

// ! ASSETS DATA MODELS
const ASSETMETADATA_MODEL = require("./AssetsData_Models/Central_Models/AssetsMetaData");
const ASSETAMC_MODEL = require("./AssetsData_Models/Classification_Models/AssetAMC");
const ASSETCATEGORY_MODEL = require("./AssetsData_Models/Classification_Models/AssetCategory");
const ASSETCLASS_MODEL = require("./AssetsData_Models/Classification_Models/AssetClass");
const ASSEINDEXNAME_MODEL = require("./AssetsData_Models/Classification_Models/AssetIndexName");
const ASSETINDUSTRY_MODEL = require("./AssetsData_Models/Classification_Models/AssetIndustry");
const ASSETSECTOR_MODEL = require("./AssetsData_Models/Classification_Models/AssetSector");
const ASSETSUBCATEGORY_MODEL = require("./AssetsData_Models/Classification_Models/AssetSubcategory");
const ASSETPRICEHISTORY_MODEL = require("./AssetsData_Models/Metrics_Models/AssetPriceHistory");

// ! PORTFOLIO MODELS
const PORTFOLIOGROUP_MODEL = require("./Portfolio_Models/PortfolioGroup_Models/portfolioGroup");
const FINANCIALASSET_MODEL = require("./Portfolio_Models/PortfolioMetrics_Models/financialAsset");
const NAVSYSTEM_MODEL = require("./Portfolio_Models/PortfolioMetrics_Models/navSystem");
const FIFOLEDGERSTATEMENT_MODEL = require("./Portfolio_Models/ledger_Models/fifoLedgerStatement");
const GROUPSTATEMENT_MODEL = require("./Portfolio_Models/ledger_Models/groupStatement");
const LEDGERSTATEMENT_MODEL = require("./Portfolio_Models/ledger_Models/ledgerStatement");
const PORTFOLIOREBALANCER_MODEL = require("./Portfolio_Models/PortfolioMetrics_Models/portfolioRebalancer");

const log = require("../utils/shared/console_Loggers/consoleLoggers");

module.exports.registerModels = () => {
  log.success("All Models Registered Successfully");
};
