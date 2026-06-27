import rebalancerHeadStyles from "./rebalancerhead.module.css";

const formatINR = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatSignedINR = (value) => {
  const number = Number(value || 0);
  const sign = number < 0 ? "-" : "";

  return `${sign}Rs.${formatINR(Math.abs(number))}`;
};

const formatPercent = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return `${Number(value).toFixed(2)}%`;
};

const InfoItem = ({ label, value }) => {
  return (
    <div>
      <h4 className={rebalancerHeadStyles.label}>{label}</h4>
      <h4 className={rebalancerHeadStyles.amount}>{value}</h4>
    </div>
  );
};

const RebalancerHead = ({ rebalancer }) => {
  const summary = rebalancer?.summary || {};

  return (
    <div className={rebalancerHeadStyles.container}>
      <h4 className={rebalancerHeadStyles.title}>Portfolio Rebalancer</h4>
      <div className={rebalancerHeadStyles.contentContainer}>
        <div className={rebalancerHeadStyles.contentTitleContainer}>
          <h4 className={rebalancerHeadStyles.contentTitle}>Rebalancer Name</h4>
          <h4 className={rebalancerHeadStyles.sipAmount}>
            {rebalancer?.rebalancerName || "-"}
          </h4>
          <h4 className={rebalancerHeadStyles.contentTitle}>
            Description
          </h4>
          <p className={rebalancerHeadStyles.description}>
            {rebalancer?.rebalancerDescription || "-"}
          </p>
        </div>

        <div className={rebalancerHeadStyles.investmentStatsContainer}>
          <InfoItem
            label="SIP Amount"
            value={`Rs.${formatINR(summary.sipAmount)}`}
          />
          <InfoItem
            label="Invested Value"
            value={`Rs.${formatINR(summary.investmentValue)}`}
          />
          <InfoItem
            label="Current Value"
            value={`Rs.${formatINR(summary.currentValue)}`}
          />
          <InfoItem
            label="Profit / Loss"
            value={formatSignedINR(summary.price?.price)}
          />
          <InfoItem
            label="Profit / Loss %"
            value={formatPercent(summary.price?.today)}
          />
        </div>
      </div>
    </div>
  );
};

export default RebalancerHead;
