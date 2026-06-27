import styles from "./assetLevelRebalancerCards.module.css";

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
  return `Rs.${formatMoney(value)}`;
};

const formatSignedCurrency = (value) => {
  if (isEmpty(value)) return "-";

  const number = Number(value);
  const sign = number < 0 ? "-" : "";

  return `${sign}Rs.${formatMoney(Math.abs(number))}`;
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

const getAssetTypeClass = (groupName = "") => {
  const normalizedAssetType = groupName.replaceAll(" ", "_").toUpperCase();
  if (normalizedAssetType === "STABLE_ASSETS") return styles.stable;
  if (normalizedAssetType === "UNSTABLE_ASSETS") return styles.unstable;
  if (normalizedAssetType === "CASH_RESERVE") return styles.cashReserve;
  return styles.defaultAssetType;
};

const getStatusClass = (status = "") => {
  if (status === "INSIDE") return styles.inside;
  return styles.outside;
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

const AssetLevelRebalancerCards = ({ data = [] }) => {
  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <h4 className={styles.title}>assetLevelData</h4>
          <p className={styles.subtitle}>
            Backend asset level meta, position and metrics
          </p>
        </div>
      </div>

      <div className={styles.cardsContainer}>
        {data.map((asset, index) => {
          const meta = asset?.meta || {};
          const position = asset?.position || {};
          const metrics = asset?.metrics || {};

          return (
            <article className={styles.card} key={`${meta.assetName}-${index}`}>
              <div className={styles.cardTop}>
                <div className={styles.assetBlock}>
                  <h4 className={styles.assetName}>{meta.assetName}</h4>

                  <span
                    className={`${styles.assetTypeBadge} ${getAssetTypeClass(
                      meta.groupName,
                    )}`}>
                    {meta.groupName || "Group"}
                  </span>
                </div>

                <div className={styles.badgeGroup}>
                  <span
                    className={`${styles.statusBadge} ${getStatusClass(
                      metrics.status,
                    )}`}>
                    {metrics.status}
                  </span>
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

                <InfoItem
                  label="SIP Amount"
                  value={formatCurrency(metrics.sipAmount)}
                />
              </div>

              <div className={styles.divider} />

              <div className={styles.detailsSection}>
                <DetailGroup title="Allocation">
                  <InfoItem label="Asset Name" value={meta.assetName || "-"} />
                  <InfoItem label="Group Name" value={meta.groupName || "-"} />
                  <InfoItem
                    label="Target Weight"
                    value={formatPercent(meta.targetWeight)}
                  />
                  <InfoItem label="Band" value={formatPercent(meta.band)} />
                  <InfoItem
                    label="Relative Band"
                    value={formatPercent(meta.relativeBand)}
                  />
                  <InfoItem
                    label="Upper Limit"
                    value={formatPercent(meta.upperLimit)}
                  />
                  <InfoItem
                    label="Lower Limit"
                    value={formatPercent(meta.lowerLimit)}
                  />
                  <InfoItem
                    label="Multiplier"
                    value={formatDecimal(meta.multiplier)}
                  />
                  <InfoItem
                    label="Discount Factor"
                    value={formatDecimal(meta.discountFactor)}
                  />
                </DetailGroup>

                <DetailGroup title="Position">
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
                </DetailGroup>

                <DetailGroup title="Metrics">
                  <InfoItem
                    label="Current Weight"
                    value={formatPercent(metrics.currentWeight)}
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
                  <InfoItem
                    label="SIP Score"
                    value={formatScore(metrics.sipScore)}
                  />
                  <InfoItem
                    label="Lumpsum Score"
                    value={formatScore(metrics.lumpsumScore)}
                  />
                  <InfoItem
                    label="SIP Amount"
                    value={formatCurrency(metrics.sipAmount)}
                  />
                  <InfoItem
                    label="Lumpsum Amount"
                    value={formatCurrency(metrics.lumpsumAmount)}
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
