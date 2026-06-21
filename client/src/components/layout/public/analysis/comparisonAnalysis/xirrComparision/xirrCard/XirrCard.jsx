import PriceBadge from "../../../../priceBadge/PriceBadge";
import xirrCardStyles from "./xirrcard.module.css";

const XirrCard = ({ xirrComparisionStats }) => {
  return (
    <div className={xirrCardStyles.analysisContainer}>
      <div className={xirrCardStyles.cardSubtitleContainer}>
        <h4 className={xirrCardStyles.cardSubtitle}>Vs</h4>
        <span className={xirrCardStyles.cardSubtitleIndex}>
          {xirrComparisionStats?.indexName || "N/A"}
        </span>
      </div>
      <div className={xirrCardStyles.zoneContainer}>
        <div className={xirrCardStyles.zone}>
          <div className={xirrCardStyles.zoneContent}>
            <div className={xirrCardStyles.infoItem}>
              <div className={xirrCardStyles.label}>Group XIRR :</div>
              <PriceBadge
                price={{
                  today:
                    xirrComparisionStats?.xirrAnalysis?.groupXirr || "0.00",
                }}
              />
            </div>

            <div className={xirrCardStyles.infoItem}>
              <div className={xirrCardStyles.label}>Index XIRR :</div>
              <PriceBadge
                price={{
                  today:
                    xirrComparisionStats?.xirrAnalysis?.indexXirr || "0.00",
                }}
              />
            </div>

            <div className={xirrCardStyles.infoItem}>
              <div className={xirrCardStyles.label}>Alpha :</div>
              <PriceBadge
                price={{
                  today: xirrComparisionStats?.xirrAnalysis?.alpha || "0.00",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XirrCard;
