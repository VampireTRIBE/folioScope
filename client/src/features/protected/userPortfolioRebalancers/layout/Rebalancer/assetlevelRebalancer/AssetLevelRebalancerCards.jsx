import styles from "./assetLevelRebalancerCards.module.css";

const defaultAssetLevelData = [
  {
    asset: "MIDCAPETF",
    assetType: "UNSTABLE_ASSETS",
    weight: 12,
    band: 2.5,
    relBand: 20.83,
    upperLimit: 14.5,
    lowerLimit: 9.5,
    investedValue: 90906,
    currentValue: 94866,
    profitLoss: 3960,
    profitLossPercent: 4.36,
    currentWeight: 10.73,
    drift: -1.27,
    multiplier: 1.1,
    discountFactor: 1,
    sipScore: 0.06725,
    lumpsumScore: 0.073979,
    status: "INSIDE",
    driftAmount: -11265,
    rawSip: 4782,
    finalSip: 4780,
    lumpsumAmount: 0,
  },
  {
    asset: "HNGSNGBEES",
    assetType: "UNSTABLE_ASSETS",
    weight: 5,
    band: 1.75,
    relBand: 35,
    upperLimit: 6.75,
    lowerLimit: 3.25,
    investedValue: 38967,
    currentValue: 35054,
    profitLoss: -3913,
    profitLossPercent: -10.04,
    currentWeight: 3.96,
    drift: -1.04,
    multiplier: 0.95,
    discountFactor: 1,
    sipScore: 0.02814,
    lumpsumScore: 0.026728,
    status: "INSIDE",
    driftAmount: -9168,
    rawSip: 2000,
    finalSip: 2000,
    lumpsumAmount: 0,
  },
  {
    asset: "ALPHAETF",
    assetType: "UNSTABLE_ASSETS",
    weight: 8,
    band: 2,
    relBand: 25,
    upperLimit: 10,
    lowerLimit: 6,
    investedValue: 60276,
    currentValue: 63158,
    profitLoss: 2882,
    profitLossPercent: 4.78,
    currentWeight: 7.14,
    drift: -0.86,
    multiplier: 1,
    discountFactor: 1,
    sipScore: 0.03435,
    lumpsumScore: 0.034355,
    status: "INSIDE",
    driftAmount: -7596,
    rawSip: 2443,
    finalSip: 2440,
    lumpsumAmount: 0,
  },
  {
    asset: "HDFCSILVER",
    assetType: "STABLE_ASSETS",
    weight: 6,
    band: 1.75,
    relBand: 29.17,
    upperLimit: 7.75,
    lowerLimit: 4.25,
    investedValue: 64214,
    currentValue: 46592,
    profitLoss: -17622,
    profitLossPercent: -27.44,
    currentWeight: 5.27,
    drift: -0.73,
    multiplier: 0.8,
    discountFactor: 1.17,
    sipScore: 0.02358,
    lumpsumScore: 0.018863,
    status: "INSIDE",
    driftAmount: -6474,
    rawSip: 1677,
    finalSip: 1680,
    lumpsumAmount: 0,
  },
  {
    asset: "JUNIORBEES",
    assetType: "UNSTABLE_ASSETS",
    weight: 14,
    band: 2.5,
    relBand: 17.86,
    upperLimit: 16.5,
    lowerLimit: 11.5,
    investedValue: 114037,
    currentValue: 121602,
    profitLoss: 7565,
    profitLossPercent: 6.63,
    currentWeight: 13.75,
    drift: -0.25,
    multiplier: 1.1,
    discountFactor: 1,
    sipScore: 0.01545,
    lumpsumScore: 0.016992,
    status: "INSIDE",
    driftAmount: -2218,
    rawSip: 1098,
    finalSip: 1100,
    lumpsumAmount: 0,
  },
  {
    asset: "MON100",
    assetType: "UNSTABLE_ASSETS",
    weight: 12,
    band: 2.5,
    relBand: 20.83,
    upperLimit: 14.5,
    lowerLimit: 9.5,
    investedValue: 77048,
    currentValue: 108172,
    profitLoss: 31124,
    profitLossPercent: 40.4,
    currentWeight: 12.23,
    drift: 0.23,
    multiplier: 1.05,
    discountFactor: 1,
    sipScore: 0,
    lumpsumScore: 0,
    status: "INSIDE",
    driftAmount: 2041,
    rawSip: 0,
    finalSip: 0,
    lumpsumAmount: 0,
  },
  {
    asset: "HDFCSML250",
    assetType: "UNSTABLE_ASSETS",
    weight: 10,
    band: 2.5,
    relBand: 25,
    upperLimit: 12.5,
    lowerLimit: 7.5,
    investedValue: 86672,
    currentValue: 92738,
    profitLoss: 6066,
    profitLossPercent: 7,
    currentWeight: 10.49,
    drift: 0.49,
    multiplier: 1.05,
    discountFactor: 1,
    sipScore: 0,
    lumpsumScore: 0,
    status: "INSIDE",
    driftAmount: 4295,
    rawSip: 0,
    finalSip: 0,
    lumpsumAmount: 0,
  },
  {
    asset: "GOLDIETF",
    assetType: "STABLE_ASSETS",
    weight: 15,
    band: 3,
    relBand: 20,
    upperLimit: 18,
    lowerLimit: 12,
    investedValue: 172436,
    currentValue: 143276,
    profitLoss: -29160,
    profitLossPercent: -16.91,
    currentWeight: 16.2,
    drift: 1.2,
    multiplier: 0.75,
    discountFactor: 1.07,
    sipScore: 0,
    lumpsumScore: 0,
    status: "INSIDE",
    driftAmount: 10612,
    rawSip: 0,
    finalSip: 0,
    lumpsumAmount: 0,
  },
  {
    asset: "SETFNIF50",
    assetType: "UNSTABLE_ASSETS",
    weight: 18,
    band: 3,
    relBand: 16.67,
    upperLimit: 21,
    lowerLimit: 15,
    investedValue: 184832,
    currentValue: 178969,
    profitLoss: -5863,
    profitLossPercent: -3.17,
    currentWeight: 20.24,
    drift: 2.24,
    multiplier: 1.1,
    discountFactor: 1,
    sipScore: 0,
    lumpsumScore: 0,
    status: "INSIDE",
    driftAmount: 19772,
    rawSip: 0,
    finalSip: 0,
    lumpsumAmount: 0,
  },
  {
    asset: "DEBT_BONDS_ETFs",
    assetType: "CASH_RESERVE",
    weight: 15,
    band: 4,
    relBand: 26.67,
    upperLimit: 19,
    lowerLimit: 11,
    investedValue: 127543,
    currentValue: 129438,
    profitLoss: 1895,
    profitLossPercent: 1.49,
    currentWeight: 14.64,
    drift: -0.36,
    multiplier: null,
    discountFactor: null,
    sipScore: null,
    lumpsumScore: null,
    status: "INSIDE",
    driftAmount: -3226,
    rawSip: null,
    finalSip: null,
    lumpsumAmount: null,
  },
];

const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};

const formatMoney = (value) => {
  if (isEmpty(value)) return "-";

  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const formatCurrency = (value) => {
  if (isEmpty(value)) return "-";
  return `₹${formatMoney(value)}`;
};

const formatSignedCurrency = (value) => {
  if (isEmpty(value)) return "-";

  const number = Number(value);
  const sign = number < 0 ? "-" : "";

  return `${sign}₹${formatMoney(Math.abs(number))}`;
};

const formatPercent = (value) => {
  if (isEmpty(value)) return "-";
  return `${Number(value).toFixed(2)}%`;
};

const formatDecimal = (value) => {
  if (isEmpty(value)) return "-";
  return Number(value).toFixed(2);
};

const formatScore = (value) => {
  if (isEmpty(value)) return "-";
  return Number(value).toFixed(6);
};

const getSignClass = (value) => {
  if (isEmpty(value)) return "";

  const number = Number(value);

  if (number > 0) return styles.positive;
  if (number < 0) return styles.negative;

  return styles.neutral;
};

const getAssetTypeClass = (assetType = "") => {
  const normalizedAssetType = assetType.replaceAll(" ", "_");
  if (normalizedAssetType === "STABLE_ASSETS") return styles.stable;
  if (normalizedAssetType === "UNSTABLE_ASSETS") return styles.unstable;
  if (normalizedAssetType === "CASH_RESERVE") return styles.cashReserve;
  return styles.defaultAssetType;
};

const getStatusClass = (status = "") => {
  if (status === "INSIDE") return styles.inside;
  return styles.outside;
};

const getActionLabel = (finalSip, lumpsumAmount) => {
  if (Number(finalSip || 0) > 0) return `SIP ₹${formatMoney(finalSip)}`;
  if (Number(lumpsumAmount || 0) > 0) {
    return `Lumpsum ₹${formatMoney(lumpsumAmount)}`;
  }

  return "No Buy";
};

const InfoItem = ({ label, value, valueClass = "" }) => {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${valueClass}`}>{value}</span>
    </div>
  );
};

const DetailGroup = ({ title, children }) => {
  return (
    <div className={styles.detailGroup}>
      <h5 className={styles.groupTitle}>{title}</h5>
      <div className={styles.detailItems}>{children}</div>
    </div>
  );
};

const AssetLevelRebalancerCards = ({ data = defaultAssetLevelData }) => {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h4 className={styles.title}>Asset Level Rebalancer</h4>
          <p className={styles.subtitle}>
            Asset allocation, drift, SIP priority and deployment amount
          </p>
        </div>
      </div>

      <div className={styles.cardsContainer}>
        {data.map((asset) => {
          const actionLabel = getActionLabel(asset.finalSip, asset.lumpsumAmount);

          return (
            <article className={styles.card} key={asset.asset}>
              <div className={styles.cardTop}>
                <div className={styles.assetBlock}>
                  <h4 className={styles.assetName}>{asset.asset}</h4>

                  <span
                    className={`${styles.assetTypeBadge} ${getAssetTypeClass(
                      asset.assetType,
                    )}`}
                  >
                    {asset.assetType}
                  </span>
                </div>

                <div className={styles.badgeGroup}>
                  <span
                    className={`${styles.actionBadge} ${
                      actionLabel === "No Buy" ? styles.noBuy : styles.buy
                    }`}
                  >
                    {actionLabel}
                  </span>

                  <span
                    className={`${styles.statusBadge} ${getStatusClass(
                      asset.status,
                    )}`}
                  >
                    {asset.status}
                  </span>
                </div>
              </div>

              <div className={styles.mainStats}>
                <InfoItem
                  label="CRR Value"
                  value={formatCurrency(asset.currentValue)}
                />

                <InfoItem
                  label="P / L"
                  value={formatSignedCurrency(asset.profitLoss)}
                  valueClass={getSignClass(asset.profitLoss)}
                />

                <InfoItem
                  label="P / L %"
                  value={formatPercent(asset.profitLossPercent)}
                  valueClass={getSignClass(asset.profitLossPercent)}
                />

                <InfoItem
                  label="CRR Weight"
                  value={formatPercent(asset.currentWeight)}
                />

                <InfoItem
                  label="Drift"
                  value={formatPercent(asset.drift)}
                  valueClass={getSignClass(asset.drift)}
                />

                <InfoItem
                  label="Final SIP"
                  value={formatCurrency(asset.finalSip)}
                />
              </div>

              <div className={styles.divider} />

              <div className={styles.detailsSection}>
                <DetailGroup title="Allocation Limits">
                  <InfoItem label="Weight" value={formatPercent(asset.weight)} />
                  <InfoItem label="Band" value={formatPercent(asset.band)} />
                  <InfoItem label="Rel Band" value={formatPercent(asset.relBand)} />
                  <InfoItem
                    label="Upper Limit"
                    value={formatPercent(asset.upperLimit)}
                  />
                  <InfoItem
                    label="Lower Limit"
                    value={formatPercent(asset.lowerLimit)}
                  />
                </DetailGroup>

                <DetailGroup title="Value Position">
                  <InfoItem
                    label="Invested Value"
                    value={formatCurrency(asset.investedValue)}
                  />

                  <InfoItem
                    label="Drift Amount"
                    value={formatSignedCurrency(asset.driftAmount)}
                    valueClass={getSignClass(asset.driftAmount)}
                  />

                  <InfoItem label="Raw SIP" value={formatCurrency(asset.rawSip)} />

                  <InfoItem
                    label="Lumpsum Amount"
                    value={formatCurrency(asset.lumpsumAmount)}
                  />
                </DetailGroup>

                <DetailGroup title="Scoring">
                  <InfoItem
                    label="Multiplier"
                    value={formatDecimal(asset.multiplier)}
                  />

                  <InfoItem
                    label="Discount Factor"
                    value={formatDecimal(asset.discountFactor)}
                  />

                  <InfoItem
                    label="SIP Score"
                    value={formatScore(asset.sipScore)}
                  />

                  <InfoItem
                    label="Lumpsum Score"
                    value={formatScore(asset.lumpsumScore)}
                  />
                </DetailGroup>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default AssetLevelRebalancerCards;