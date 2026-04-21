const { date } = require("joi");
const {
  getDailyClosePricesByFinancialAsset,
} = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/getMarketPrice");
const {
  normalizeToIST5PM,
  normalizeToIST330PM,
} = require("../../../utils/shared_Utils/helpers/getCurrentFinacialyear");
const { session } = require("passport");

module.exports.defaultNavComparison = async ({
  indexId = null,
  groupId = null,
  startDate = null,
  session = null,
}) => {
  if (!indexId || !groupId || !startDate || !session) {
    throw new Error("Missing Request Parameters");
  }
  const [indexPastPrices, navPastPrices] = await Promise.all([
    getDailyClosePricesByFinancialAsset(
      indexId,
      new Date(startDate),
      false,
      session,
    ),
    getDailyClosePricesByFinancialAsset(
      groupId,
      new Date(startDate),
      true,
      session,
    ),
  ]);

  let navBasedMetrics = {
    standalone: {},
    comparison: {},
  };

  const dateSeries = Object.keys(navPastPrices);
  if (dateSeries.length < 2) {
    return navBasedMetrics;
  }

  let normalizeNavsSeries = {};
  let groupCurveValue = {};
  const groupStartPrice = navPastPrices[dateSeries[0]].nav;
  const indexStartPrice =
    indexPastPrices[normalizeToIST330PM(new Date(dateSeries[0])).toISOString()];

  for (const day of dateSeries) {
    let indexNav =
      (indexPastPrices[normalizeToIST330PM(new Date(day)).toISOString()] /
        indexStartPrice) *
      groupStartPrice;
    normalizeNavsSeries[day] = {
      index: indexNav ? Number(indexNav) : 0,
      group: navPastPrices[day].nav ? navPastPrices[day].nav : 0,
    };
    let value = navPastPrices[day].nav * navPastPrices[day].units;
    groupCurveValue[day] = value ? value : 0;
  }

  dateSeries.sort((a, b) => new Date(b) - new Date(a));

  let v1 = dateSeries[0];
  let v2 = dateSeries[1];
  let v3 = dateSeries[89];
  let v4 = dateSeries[364];
  let v5 = dateSeries[1094];
  let lastValue = dateSeries[dateSeries.length - 1];

  const valueCalculation = (x, y, Key1, key2) => {
    let indexReturn = Number(
      ((normalizeNavsSeries[x].index - normalizeNavsSeries[y].index) /
        normalizeNavsSeries[y].index) *
        100,
    );
    let groupReturn = Number(
      ((normalizeNavsSeries[x].group - normalizeNavsSeries[y].group) /
        normalizeNavsSeries[y].group) *
        100,
    );

    navBasedMetrics.standalone[groupId] ??= {};
    navBasedMetrics.standalone[indexId] ??= {};

    navBasedMetrics.standalone[groupId][Key1] = groupReturn ? groupReturn : 0;
    navBasedMetrics.standalone[indexId][Key1] = indexReturn ? indexReturn : 0;
    navBasedMetrics.comparison[key2] =
      groupReturn - indexReturn ? groupReturn - indexReturn : 0;
  };

  if (v1 && v2) {
    valueCalculation(v1, v2, "1Day", "1DayAlpha");
  }
  if (v3) {
    valueCalculation(v1, v3, "3Months", "3MonthsAlpha");
  }
  if (!v3) {
    valueCalculation(v1, lastValue, "3MonthsPartial", "3MonthsAlphaPartial");
    return {
      groupCurveValue,
      normalizeNavsSeries,
      navBasedMetrics,
      indexPastPrices,
      navPastPrices,
    };
  }
  if (v4) {
    valueCalculation(v1, v4, "1Year", "1YearAlpha");
  }
  if (!v4) {
    valueCalculation(v1, lastValue, "1YearPartial", "1YearAlphaPartial");
    return {
      groupCurveValue,
      normalizeNavsSeries,
      navBasedMetrics,
      indexPastPrices,
      navPastPrices,
    };
  }
  if (v5) {
    valueCalculation(v1, v5, "3Year", "3YearAlpha");
  }
  if (!v5) {
    valueCalculation(v1, lastValue, "3YearPartial", "3YearAlphaPartial");
    return {
      groupCurveValue,
      normalizeNavsSeries,
      navBasedMetrics,
      indexPastPrices,
      navPastPrices,
    };
  }
  return {
    dateSeries,
    groupCurveValue,
    normalizeNavsSeries,
    navBasedMetrics,
    indexPastPrices,
    navPastPrices,
  };
};
