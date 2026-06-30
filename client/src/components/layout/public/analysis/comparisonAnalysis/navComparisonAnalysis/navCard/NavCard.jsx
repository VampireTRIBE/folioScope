import PriceBadge from "../../../../priceBadge/PriceBadge";
import navCardStyles from "./navcard.module.css";

const NavCard = ({ meta, drawdown, peak, isDummy }) => {
  return (
    <div
      className={`${navCardStyles.analysisContainer} ${
        isDummy ? navCardStyles.dummy : ""
      }`}>
      <div className={navCardStyles.summaryContainer}>
        <div className={navCardStyles.summaryItem}>
          <div className={navCardStyles.label}>Period :</div>
          <div className={navCardStyles.value}>{meta?.period ?? "N/A"}</div>
        </div>

        <div className={navCardStyles.summaryItem}>
          <div className={navCardStyles.label}>Excess Return :</div>
          <PriceBadge price={{ today: meta?.periodReturn ?? "0.00" }} />
        </div>
      </div>

      <div className={navCardStyles.zoneContainer}>
        <div className={navCardStyles.zone}>
          <div className={navCardStyles.zoneTitle}>Excess Drawdown Zone</div>

          <div className={navCardStyles.zoneContent}>
            <div className={navCardStyles.infoItem}>
              <div className={navCardStyles.label}>Current Drawdown :</div>

              <PriceBadge price={{ today: drawdown?.current ?? "0.00" }} />
            </div>

            <div className={navCardStyles.infoItem}>
              <div className={navCardStyles.label}>Max Drawdown :</div>

              <PriceBadge price={{ today: drawdown?.max ?? "0.00" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavCard;
