import PriceBadge from "../../../../priceBadge/PriceBadge";
import navCardStyles from "./navcard.module.css";

const NavCard = () => {
  return (
    <div className={navCardStyles.analysisContainer}>
      <div className={navCardStyles.cardSubtitleContainer}>
        <h4 className={navCardStyles.cardSubtitle}>Vs</h4>
        <span className={navCardStyles.cardSubtitleIndex}>Nifty 50</span>
      </div>
      <div className={navCardStyles.zoneContainer}>
        <div>Need to think of UI</div>
        {/* <div className={navCardStyles.zone}>
          <div className={navCardStyles.zoneContent}>
            <div className={navCardStyles.infoItem}>
              <div className={navCardStyles.label}>Group XIRR :</div>
              <PriceBadge price={{ today: "0.00" }} />
            </div>

            <div className={navCardStyles.infoItem}>
              <div className={navCardStyles.label}>Index XIRR :</div>
              <PriceBadge price={{ today: "0.00" }} />
            </div>

            <div className={navCardStyles.infoItem}>
              <div className={navCardStyles.label}>Alpha :</div>
              <PriceBadge price={{ today: "0.00" }} />
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default NavCard;
