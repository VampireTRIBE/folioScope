// ! UI Component
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import holdingSummaryStyles from "./holdingsummary.module.css";

const HoldingSummary = ({
  totalInvested = 0,
  currentValue = 0,
  todaysGain = 0,
  todaysGainPercentage = "0.00%",
  groupXirr = {
    xirr: "0.00%",
    lastcomputed: null,
  },
}) => {
  const invested = Number(totalInvested || 0);
  const current = Number(currentValue || 0);
  const todayGain = Number(todaysGain || 0);

  const totalProfitLoss = current - invested;

  const totalProfitLossPercentage =
    invested > 0
      ? `${((totalProfitLoss / invested) * 100).toFixed(2)}%`
      : "0.00%";
  const groupXirrLastComputed = groupXirr?.lastcomputed
    ? new Date(groupXirr.lastcomputed).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Not computed";

  return (
    <div className={holdingSummaryStyles.container}>
      <div className={holdingSummaryStyles.item}>
        <div className={holdingSummaryStyles.label}>Total Invested</div>

        <div className={holdingSummaryStyles.value}>
          <PriceBadge
            price={{ price: invested }}
            currency={true}
            percentage={false}
          />
        </div>
      </div>

      <div className={holdingSummaryStyles.item}>
        <div className={holdingSummaryStyles.label}>Current Value</div>

        <div className={holdingSummaryStyles.value}>
          <PriceBadge
            price={{ price: current }}
            currency={true}
            percentage={false}
          />
        </div>
      </div>

      <div className={holdingSummaryStyles.item}>
        <div className={holdingSummaryStyles.label}>Total Profit / Loss</div>

        <div className={holdingSummaryStyles.value}>
          <PriceBadge
            price={{
              price: totalProfitLoss,
              today: totalProfitLossPercentage,
            }}
            currency={true}
            percentage={true}
          />
        </div>
      </div>

      <div className={holdingSummaryStyles.item}>
        <div className={holdingSummaryStyles.label}>Today's Gain</div>

        <div className={holdingSummaryStyles.value}>
          <PriceBadge
            price={{
              price: todayGain,
              today: todaysGainPercentage,
            }}
            currency={true}
            percentage={true}
          />
        </div>
      </div>

      <div className={holdingSummaryStyles.item}>
        <div className={holdingSummaryStyles.label}>Group XIRR</div>

        <div className={holdingSummaryStyles.value}>
          <PriceBadge
            price={{
              today: groupXirr?.xirr || "0.00%",
            }}
            priceValue={false}
            percentage={true}
          />
        </div>
        <div className={holdingSummaryStyles.meta}>
          Last computed: {groupXirrLastComputed}
        </div>
      </div>
    </div>
  );
};

export default HoldingSummary;
