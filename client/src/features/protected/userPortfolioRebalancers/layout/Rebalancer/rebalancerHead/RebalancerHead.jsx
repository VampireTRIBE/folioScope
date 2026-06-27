import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";
import rebalancerHeadStyles from "./rebalancerhead.module.css";

const formatINR = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getFirstNumber = (...values) => {
  const value = values.find(
    (item) => item !== null && item !== undefined && item !== "",
  );

  return Number(value || 0);
};

const RebalancerHead = ({ rebalancer }) => {
  const stats = rebalancer?.stats || rebalancer?.summary || {};
  const sipAmount = getFirstNumber(
    rebalancer?.sipAmount,
    stats?.sipAmount,
    stats?.monthlySip,
  );
  const investedValue = getFirstNumber(
    rebalancer?.investedValue,
    stats?.investedValue,
    stats?.totalInvested,
  );
  const currentValue = getFirstNumber(
    rebalancer?.currentValue,
    stats?.currentValue,
    stats?.totalCurrent,
  );
  const price = rebalancer?.price || rebalancer?.todayChange || {
    price: getFirstNumber(rebalancer?.todaysGain?.price, stats?.todaysGain),
    today: rebalancer?.todaysGain?.today || stats?.today || "0.00%",
  };

  return (
    <div className={rebalancerHeadStyles.container}>
      <h4 className={rebalancerHeadStyles.title}>Portfolio Rebalancer</h4>
      <div className={rebalancerHeadStyles.contentContainer}>
        <div className={rebalancerHeadStyles.contentTitleContainer}>
          <h4 className={rebalancerHeadStyles.contentTitle}>SIP AMOUNT</h4>
          <h4 className={rebalancerHeadStyles.sipAmount}>
            ₹{formatINR(sipAmount)}
          </h4>
        </div>
        <div className={rebalancerHeadStyles.investmentStatsContainer}>
          <div>
            <h4 className={rebalancerHeadStyles.label}>INVESTED VALUE</h4>
            <h4 className={rebalancerHeadStyles.amount}>
              ₹{formatINR(investedValue)}
            </h4>
          </div>
          <div>
            <h4 className={rebalancerHeadStyles.label}>INVESTED VALUE</h4>
            <h4 className={rebalancerHeadStyles.amount}>
              ₹{formatINR(currentValue)}
            </h4>
          </div>
          <div>
            <PriceBadge price={price} priceValue={true} percentage={true} currency={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalancerHead;
