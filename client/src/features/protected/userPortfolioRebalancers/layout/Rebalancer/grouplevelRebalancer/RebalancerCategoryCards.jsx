import styles from "./rebalancerCategoryCards.module.css";

const isEmpty = (value) => {
  return value === null || value === undefined || value === "";
};

const parseNumber = (value) => {
  if (isEmpty(value)) return 0;

  const number = Number(
    value.toString().replace("%", "").replaceAll(",", "").trim(),
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

const formatCurrency = (value) => {
  if (isEmpty(value)) return "-";
  return `Rs.${formatINR(value)}`;
};

const formatSignedCurrency = (value) => {
  if (isEmpty(value)) return "-";

  const number = parseNumber(value);
  const sign = number < 0 ? "-" : "";

  return `${sign}Rs.${formatINR(Math.abs(number))}`;
};

const formatPercent = (value) => {
  if (isEmpty(value)) return "-";
  return `${parseNumber(value).toFixed(2)}%`;
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

const getCategoryClass = (groupName = "") => {
  const normalizedCategory = groupName.trim().toUpperCase();

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

const RebalancerCategoryCards = ({ data = [] }) => {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h4 className={styles.title}>groupLevelData</h4>
          <p className={styles.subtitle}>
            Backend group level meta, position and metrics
          </p>
        </div>
      </div>

      <div className={styles.cardsContainer}>
        {data.map((item, index) => {
          const meta = item?.meta || {};
          const position = item?.position || {};
          const metrics = item?.metrics || {};

          return (
            <article className={styles.card} key={`${meta.groupName}-${index}`}>
              <div className={styles.cardTop}>
                <div className={styles.categoryBlock}>
                  <h4 className={styles.categoryTitle}>{meta.groupName}</h4>

                  <span
                    className={`${styles.categoryBadge} ${getCategoryClass(
                      meta.groupName,
                    )}`}>
                    {meta.groupName || "Group"}
                  </span>
                </div>

                <span
                  className={`${styles.statusBadge} ${getStatusClass(
                    metrics.status,
                  )}`}>
                  {metrics.status}
                </span>
              </div>

              <div className={styles.weightProgressSection}>
                <div className={styles.weightProgressHeader}>
                  <span>Current Weight</span>
                  <strong>{formatPercent(metrics.currentWeight)}</strong>
                </div>

                <div className={styles.progressMeta}>
                  <span>Lower {formatPercent(meta.lowerLimit)}</span>
                  <span>Target {formatPercent(meta.targetWeight)}</span>
                  <span>Upper {formatPercent(meta.upperLimit)}</span>
                </div>

                <div className={styles.progressTrack}>
                  <div
                    className={`${styles.progressFill} ${getStatusClass(
                      metrics.status,
                    )}`}
                    style={{
                      width: getProgressWidth({
                        currentWeight: metrics.currentWeight,
                        lowerLimit: meta.lowerLimit,
                        upperLimit: meta.upperLimit,
                      }),
                    }}
                  />
                </div>
              </div>

              <div className={styles.mainStats}>
                <InfoItem
                  label="Current Value"
                  value={formatCurrency(position.currentValue)}
                />

                <InfoItem
                  label="Invested Value"
                  value={formatCurrency(position.investedValue)}
                />

                <InfoItem
                  label="Profit / Loss"
                  value={formatSignedCurrency(position.price?.price)}
                  valueClass={getSignClass(position.price?.price)}
                />

                <InfoItem
                  label="Profit / Loss %"
                  value={formatPercent(position.price?.today)}
                  valueClass={getSignClass(position.price?.today)}
                />

                <InfoItem
                  label="Current Weight"
                  value={formatPercent(metrics.currentWeight)}
                />
              </div>

              <div className={styles.divider} />

              <div className={styles.detailsSection}>
                <InfoItem
                  label="Target Weight"
                  value={formatPercent(meta.targetWeight)}
                />

                <InfoItem label="Band" value={formatPercent(meta.band)} />

                <InfoItem
                  label="Upper Limit"
                  value={formatPercent(meta.upperLimit)}
                />

                <InfoItem
                  label="Lower Limit"
                  value={formatPercent(meta.lowerLimit)}
                />

                <InfoItem
                  label="Drift"
                  value={formatPercent(metrics.driftPercentage)}
                  valueClass={getSignClass(metrics.driftPercentage)}
                />

                <InfoItem
                  label="Drift Amount"
                  value={formatSignedCurrency(metrics.driftAmount)}
                  valueClass={getSignClass(metrics.driftAmount)}
                />

                <InfoItem label="Status" value={metrics.status || "-"} />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default RebalancerCategoryCards;
