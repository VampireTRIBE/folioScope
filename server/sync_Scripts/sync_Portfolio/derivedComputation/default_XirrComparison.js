const {
  get_DailyClosePricesByAsset,
} = require("../../../utils/mongodb/aggregations/get_AssetsPrice");
const {
  build_GroupCashflows,
} = require("../../../utils/mongodb/aggregations/get_Cashflows");
const {
  get_GroupCurrentValue,
} = require("../../../utils/mongodb/aggregations/get_GroupCurrentValue");
const {
  get_leafGroupIDsByGroup,
} = require("../../../utils/mongodb/aggregations/get_leafGroupIDsByGroup");
const {
  computeIRR,
} = require("../../../utils/shared/tools/computationFormula/xirr");
const {
  normalizeToIST330PM,
} = require("../../../utils/transformData/normalizeDates");

module.exports.default_XirrComparison = async (
  groupId = null,
  userId = null,
  indexId = null,
  session = null,
) => {
  if (!groupId || !userId || !indexId) {
    throw new Error("Missing Parameters");
  }
  try {
    const [groupLeafIDs, currentValue] = await Promise.all([
      get_leafGroupIDsByGroup(groupId, userId),
      get_GroupCurrentValue(groupId, userId),
    ]);

    let groupCashflows;

    if (groupLeafIDs.length === 0) {
      groupCashflows = await build_GroupCashflows(userId, [groupId], session);
    } else {
      groupCashflows = await build_GroupCashflows(
        userId,
        groupLeafIDs,
        session,
      );
    }

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const last = groupCashflows[groupCashflows.length - 1];

    const isSameDay = last && new Date(last.date).getTime() === today.getTime();

    if (isSameDay) {
      groupCashflows[groupCashflows.length - 1] = {
        date: today,
        amount: currentValue,
      };
    } else {
      groupCashflows.push({
        date: today,
        amount: currentValue,
      });
    }

    const indexPrices = await get_DailyClosePricesByAsset(
      indexId,
      new Date(groupCashflows[0].date),
      false,
      null,
      new Date(today),
    );

    const totalUnits = groupCashflows.reduce((acc, { date, amount }, index) => {
      const dateKey = normalizeToIST330PM(new Date(date));
      if (index === groupCashflows.length - 1) return acc;
      return (acc += -(amount / indexPrices[dateKey.toISOString()]));
    }, 0);

    let indexCashflows = structuredClone(groupCashflows);
    const dateKey = normalizeToIST330PM(
      new Date(indexCashflows[indexCashflows.length - 1].date),
    ).toISOString();

    indexCashflows[indexCashflows.length - 1].amount =
      totalUnits * indexPrices[dateKey];

    const groupXirr = Number(computeIRR(groupCashflows)).toFixed(2);
    const indexXirr = Number(computeIRR(indexCashflows)).toFixed(2);

    return {
      xirrBasedAnalysis: {
        xirr: {
          groupXirr,
          indexXirr,
          alpha: groupXirr - indexXirr,
        },
      },
    };
  } catch (error) {
    throw new Error("Error IN computation");
  }
};
