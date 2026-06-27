import styles from "./rebalancerCategoryCards.module.css";

const categoryData = [
  {
    categoryLevel: "STABLE_ASSETS",
    weight: 20,
    band: 4,
    upperLimit: 24,
    lowerLimit: 16,
    currentValue: 189868,
    currentWeight: 21.47,
    displayValue: 189868,
    drift: 1.47,
    status: "EXTREME OVER WEIGHT",
    driftAmount: 12983,
  },
  {
    categoryLevel: "UNSTABLE_ASSETS",
    weight: 80,
    band: 4,
    upperLimit: 84,
    lowerLimit: 76,
    currentValue: 694559.2,
    currentWeight: 78.53,
    displayValue: 694559,
    drift: -1.47,
    status: "INSIDE",
    driftAmount: -12983,
  },
];

const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};

const parseNumber = (value) => {
  if (isEmpty(value)) return 0;

  const number = Number(
    value
      .toString()
      .replace("%", "")
      .replace("₹", "")
      .replaceAll(",", "")
      .trim(),
  );

  return Number.isFinite(number) ? number : 0;
};

const formatINR = (value) => {
  if (isEmpty(value)) return "-";

  return parseNumber(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatNumber = (value) => {
  if (isEmpty(value)) return "-";

  return parseNumber(value).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });
};

const formatCurrency = (value) => {
  if (isEmpty(value)) return "-";
  return `₹${formatINR(value)}`;
};

const formatSignedCurrency = (value) => {
  if (isEmpty(value)) return "-";

  const number = parseNumber(value);
  const sign = number < 0 ? "-" : "";

  return `${sign}₹${formatNumber(Math.abs(number))}`;
};

const formatPercent = (value) => {
  if (isEmpty(value)) return "-";
  return `${parseNumber(value).toFixed(2)}%`;
};

const getComputedStatus = (item) => {
  const currentWeight = parseNumber(item.currentWeight);
  const lowerLimit = parseNumber(item.lowerLimit);
  const upperLimit = parseNumber(item.upperLimit);

  if (currentWeight < lowerLimit) return "EXTREME UNDER WEIGHT";
  if (currentWeight > upperLimit) return "EXTREME OVER WEIGHT";

  return "INSIDE";
};

const getSignClass = (value) => {
  if (isEmpty(value)) return "";

  const number = parseNumber(value);

  if (number > 0) return styles.positive;
  if (number < 0) return styles.negative;

  return styles.neutral;
};

const getStatusClass = (status = "") => {
  const normalizedStatus = status.trim().toUpperCase();

  if (normalizedStatus === "INSIDE") return styles.inside;
  if (normalizedStatus.includes("OVER")) return styles.overWeight;
  if (normalizedStatus.includes("UNDER")) return styles.underWeight;

  return styles.outside;
};

const getCategoryClass = (categoryLevel = "") => {
  const normalizedCategory = categoryLevel.trim().toUpperCase();

  if (normalizedCategory === "STABLE_ASSETS") return styles.stableCategory;
  if (normalizedCategory === "UNSTABLE_ASSETS") return styles.unstableCategory;
  if (normalizedCategory === "CASH_RESERVE") return styles.cashCategory;

  return styles.defaultCategory;
};

const getProgressWidth = ({ currentWeight, lowerLimit, upperLimit }) => {
  const current = parseNumber(currentWeight);
  const lower = parseNumber(lowerLimit);
  const upper = parseNumber(upperLimit);

  if (upper <= lower) return "0%";

  const width = ((current - lower) / (upper - lower)) * 100;
  const safeWidth = Math.min(Math.max(width, 0), 100);

  return `${safeWidth}%`;
};

const InfoItem = ({ label, value, valueClass = "" }) => {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={`${styles.infoValue} ${valueClass}`}>{value}</span>
    </div>
  );
};

const RebalancerCategoryCards = ({ data = categoryData }) => {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h4 className={styles.title}>Category Level Rebalancer</h4>
          <p className={styles.subtitle}>
            Weight, band limits, current allocation and drift status
          </p>
        </div>
      </div>

      <div className={styles.cardsContainer}>
        {data.map((item) => {
          const computedStatus = getComputedStatus(item);

          return (
            <article className={styles.card} key={item.categoryLevel}>
              <div className={styles.cardTop}>
                <div className={styles.categoryBlock}>
                  <h4 className={styles.categoryTitle}>
                    {item.categoryLevel}
                  </h4>

                  <span
                    className={`${styles.categoryBadge} ${getCategoryClass(
                      item.categoryLevel,
                    )}`}
                  >
                    {item.categoryLevel.replaceAll("_", " ")}
                  </span>
                </div>

                <span
                  className={`${styles.statusBadge} ${getStatusClass(
                    computedStatus,
                  )}`}
                >
                  {computedStatus}
                </span>
              </div>

              <div className={styles.weightProgressSection}>
                <div className={styles.weightProgressHeader}>
                  <span>Current Weight</span>
                  <strong>{formatPercent(item.currentWeight)}</strong>
                </div>

                <div className={styles.progressMeta}>
                  <span>Lower {formatPercent(item.lowerLimit)}</span>
                  <span>Target {formatPercent(item.weight)}</span>
                  <span>Upper {formatPercent(item.upperLimit)}</span>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressFill} ${getStatusClass(
                      computedStatus,
                    )}`}
                    style={{
                      width: getProgressWidth({
                        currentWeight: item.currentWeight,
                        lowerLimit: item.lowerLimit,
                        upperLimit: item.upperLimit,
                      }),
                    }}
                  />
                </div>
              </div>

              <div className={styles.mainStats}>
                <InfoItem
                  label="CRR Value"
                  value={formatCurrency(item.currentValue)}
                />

                <InfoItem
                  label="CRR Weight"
                  value={formatPercent(item.currentWeight)}
                />

                <InfoItem
                  label="Drift"
                  value={formatPercent(item.drift)}
                  valueClass={getSignClass(item.drift)}
                />

                <InfoItem
                  label="Drift Amount"
                  value={formatSignedCurrency(item.driftAmount)}
                  valueClass={getSignClass(item.driftAmount)}
                />
              </div>

              <div className={styles.divider} />

              <div className={styles.detailsSection}>
                <InfoItem
                  label="Target Weight"
                  value={formatPercent(item.weight)}
                />

                <InfoItem label="Band" value={formatPercent(item.band)} />

                <InfoItem
                  label="Upper Limit"
                  value={formatPercent(item.upperLimit)}
                />

                <InfoItem
                  label="Lower Limit"
                  value={formatPercent(item.lowerLimit)}
                />

                <InfoItem
                  label="Display Value"
                  value={`₹${formatNumber(item.displayValue)}`}
                />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default RebalancerCategoryCards;
