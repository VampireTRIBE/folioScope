import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";
import rebalancerHeadStyles from "./rebalancerhead.module.css";

const formatINR = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const RebalancerHead = () => {
  return (
    <div className={rebalancerHeadStyles.container}>
      <h4 className={rebalancerHeadStyles.title}>Portfolio Rebalancer</h4>
      <div className={rebalancerHeadStyles.contentContainer}>
        <div className={rebalancerHeadStyles.contentTitleContainer}>
          <h4 className={rebalancerHeadStyles.contentTitle}>SIP AMOUNT</h4>
          <h4 className={rebalancerHeadStyles.sipAmount}>
            ₹{formatINR(15000)}
          </h4>
        </div>
        <div className={rebalancerHeadStyles.investmentStatsContainer}>
          <div>
            <h4 className={rebalancerHeadStyles.label}>INVESTED VALUE</h4>
            <h4 className={rebalancerHeadStyles.amount}>₹{formatINR(15000)}</h4>
          </div>
          <div>
            <h4 className={rebalancerHeadStyles.label}>INVESTED VALUE</h4>
            <h4 className={rebalancerHeadStyles.amount}>₹{formatINR(15000)}</h4>
          </div>
          <div>
            <PriceBadge priceValue={true} percentage={true} currency={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RebalancerHead;
