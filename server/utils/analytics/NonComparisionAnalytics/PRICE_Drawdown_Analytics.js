const {
  get_DailyClosePricesByAsset,
} = require("../../mongodb/aggregations/get_AssetsPrice");
const {
  singleDrawdownFuntion,
} = require("../../shared/tools/computationFormula/drawdown");
const { normalizeToIST330PM } = require("../../transformData/normalizeDates");

module.exports.priceDrawdownAnalysis = async ({
  assetId = "69f655b476de7bba98957403",
  startDate = null,
  nav = false,
  session = null,
}) => {
  if (!assetId || !startDate) {
    throw new Error("Missing Request Parameters");
  }
  const pastPrices = await get_DailyClosePricesByAsset(
    assetId,
    new Date(startDate),
    nav,
    session,
  );

  let priceDrawdownAnalysis = {};

  const dateSeries = Object.keys(pastPrices);
  if (dateSeries.length < 2) {
    return priceDrawdownAnalysis;
  }

  dateSeries.sort((a, b) => new Date(b) - new Date(a));

  let v1 = dateSeries[0];
  let v2 = dateSeries[1];
  let v3 = dateSeries[89];
  let v4 = dateSeries[364];
  let v5 = dateSeries[1094];
  let lastValue = dateSeries[dateSeries.length - 1];

  const valueCalculation = (x, y, Key1) => {
    const assetIdBase = pastPrices[y];
    if (!assetIdBase) return;

    let Return = ((pastPrices[x] - assetIdBase) / assetIdBase) * 100;
    const drawdown = singleDrawdownFuntion(x, y, pastPrices);

    priceDrawdownAnalysis[assetId] ??= {};
    priceDrawdownAnalysis[assetId][Key1] ??= {};

    priceDrawdownAnalysis[assetId][Key1].return = Number.isFinite(Return)
      ? Return
      : null;

    priceDrawdownAnalysis[assetId][Key1].drawdown = {
      ...drawdown,
    };
  };

  if (v1 && v2) {
    valueCalculation(v1, v2, "1Day");
  }
  if (v3) {
    valueCalculation(v1, v3, "3Months");
  }
  if (!v3) {
    valueCalculation(v1, lastValue, "3MonthsPartial");
    return priceDrawdownAnalysis;
  }
  if (v4) {
    valueCalculation(v1, v4, "1Year");
  }
  if (!v4) {
    valueCalculation(v1, lastValue, "1YearPartial");
    return priceDrawdownAnalysis;
  }
  if (v5) {
    valueCalculation(v1, v5, "3Year");
  }
  if (!v5) {
    valueCalculation(v1, lastValue, "3YearPartial");
    return priceDrawdownAnalysis;
  }
  return priceDrawdownAnalysis;
};
