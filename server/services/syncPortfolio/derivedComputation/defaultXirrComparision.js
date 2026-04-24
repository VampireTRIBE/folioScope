const {
  get_GroupCurrentValue,
} = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/get_DataFromDatabase");
const {
  findLeafGroupIds,
} = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/getAll_NonLeafNodes");
const {
  getDailyClosePricesByFinancialAsset,
} = require("../../../utils/Portfolio_Models_utils/aggregationPipeline/getMarketPrice");
const {
  normalizeToIST330PM,
} = require("../../../utils/shared_Utils/helpers/getCurrentFinacialyear");
const {
  buildCashflows,
} = require("../../../utils/shared_Utils/mathematicalCalculations/get_Cashflows");
const {
  computeIRR,
} = require("../../../utils/shared_Utils/mathematicalCalculations/xirr");

module.exports.defaultXirrComparision = async (
  groupId = null,
  userId = null,
  indexId = null,
  session = null,
) => {
  if (!groupId || !userId || !indexId) {
    throw new Error("Missing Parameters...");
  }
  try {
    const [groupLeafIDs, currentValue] = await Promise.all([
      findLeafGroupIds(groupId, userId),
      get_GroupCurrentValue(groupId, userId),
    ]);

    let groupCashflows;

    if (groupLeafIDs.length === 0) {
      groupCashflows = await buildCashflows(userId, [groupId], session);
    } else {
      groupCashflows = await buildCashflows(userId, groupLeafIDs, session);
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

    const indexPrices = await getDailyClosePricesByFinancialAsset(
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

    let [GroupXirr, IndexXirr] = await Promise.all([
      computeIRR(groupCashflows),
      computeIRR(indexCashflows),
    ]);

    const groupXirr = Number(GroupXirr).toFixed(2);
    const indexXirr = Number(IndexXirr).toFixed(2);

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
    console.log(error);
    return;
  }
};
