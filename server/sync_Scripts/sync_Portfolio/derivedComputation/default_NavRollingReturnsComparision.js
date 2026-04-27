const {
  get_DailyClosePricesByAsset,
} = require("../../../utils/mongodb/aggregations/get_AssetsPrice");
const {
  drawdownFuntion,
} = require("../../../utils/shared/tools/computationFormula/drawdown");
const {
  normalizeToIST330PM,
} = require("../../../utils/transformData/normalizeDates");

module.exports.default_NavRollingComparison = async ({
  indexId = null,
  groupId = null,
  startDate = null,
  session = null,
}) => {
  if (!indexId || !groupId || !startDate) {
    throw new Error("Missing Request Parameters");
  }
  const [indexPastPrices, navPastPrices] = await Promise.all([
    get_DailyClosePricesByAsset(indexId, new Date(startDate), false, session),
    get_DailyClosePricesByAsset(groupId, new Date(startDate), true, session),
  ]);

  let navBasedAnalytics = {
    standalone: {},
    comparison: {},
  };

  const dateSeries = Object.keys(navPastPrices);
  if (dateSeries.length < 2) {
    return navBasedAnalytics;
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

  const valueCalculation = (x, y, Key1) => {
    const indexBase = normalizeNavsSeries[y]?.index;
    const groupBase = normalizeNavsSeries[y]?.group;

    if (!indexBase || !groupBase) return;

    let indexReturn =
      ((normalizeNavsSeries[x].index - indexBase) / indexBase) * 100;

    let groupReturn =
      ((normalizeNavsSeries[x].group - groupBase) / groupBase) * 100;

    const drawdown = drawdownFuntion(x, y, normalizeNavsSeries);

    // initialize properly
    navBasedAnalytics.standalone[groupId] ??= {};
    navBasedAnalytics.standalone[indexId] ??= {};

    navBasedAnalytics.standalone[groupId][Key1] ??= {};
    navBasedAnalytics.standalone[indexId][Key1] ??= {};

    navBasedAnalytics.standalone[groupId][Key1].return = Number.isFinite(
      groupReturn,
    )
      ? groupReturn
      : null;

    navBasedAnalytics.standalone[groupId][Key1].drawdown = {
      ...drawdown.group,
    };

    navBasedAnalytics.standalone[indexId][Key1].return = Number.isFinite(
      indexReturn,
    )
      ? indexReturn
      : null;

    navBasedAnalytics.standalone[indexId][Key1].drawdown = {
      ...drawdown.index,
    };

    navBasedAnalytics.comparison[Key1] ??= {};
    navBasedAnalytics.comparison[Key1].excessReturn = Number.isFinite(
      groupReturn - indexReturn,
    )
      ? groupReturn - indexReturn
      : null;

    navBasedAnalytics.comparison[Key1].excessDrawdown = {
      current: drawdown.group.current - drawdown.index.current,
      max: drawdown.group.max - drawdown.index.max,
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
    return {
      groupCurveValue,
      normalizeNavsSeries,
      navBasedAnalytics,
    };
  }
  if (v4) {
    valueCalculation(v1, v4, "1Year");
  }
  if (!v4) {
    valueCalculation(v1, lastValue, "1YearPartial");
    return {
      groupCurveValue,
      normalizeNavsSeries,
      navBasedAnalytics,
    };
  }
  if (v5) {
    valueCalculation(v1, v5, "3Year");
  }
  if (!v5) {
    valueCalculation(v1, lastValue, "3YearPartial");
    return {
      groupCurveValue,
      normalizeNavsSeries,
      navBasedAnalytics,
    };
  }
  return {
    groupCurveValue,
    normalizeNavsSeries,
    navBasedAnalytics,
  };
};
