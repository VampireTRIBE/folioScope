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
const customError = require("../../shared/error/customError");

module.exports.XIRR_Group = async (
  groupId = null,
  userId = null,
  session = null,
) => {
  if (!groupId || !userId) {
    throw new Error("Missing Parameters");
  }
  try {
    const [groupLeafIDs, currentValue] = await Promise.all([
      get_leafGroupIDsByGroup(groupId, userId, session),
      get_GroupCurrentValue(groupId, userId, session),
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

    const groupXirr = Number(computeIRR(groupCashflows)).toFixed(2);
    return groupXirr;
  } catch (error) {
    throw new customError("Error IN computation", 422);
  }
};
