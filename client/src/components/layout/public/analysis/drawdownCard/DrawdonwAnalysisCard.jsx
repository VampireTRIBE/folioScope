import PriceBadge from "../../priceBadge/PriceBadge";
import drawdonwAnalysisCardStyle from "./drawdonwanalysiscard.module.css";

const DrawdonwAnalysisCard = ({ meta, drawdown, peak, trough, recovery }) => {
  return (
    <div className={drawdonwAnalysisCardStyle.analysisContainer}>
      <div className={drawdonwAnalysisCardStyle.summaryContainer}>
        <div className={drawdonwAnalysisCardStyle.summaryItem}>
          <div className={drawdonwAnalysisCardStyle.label}>Period :</div>
          <div className={drawdonwAnalysisCardStyle.value}>
            {meta?.period ?? "N/A"}
          </div>
        </div>

        <div className={drawdonwAnalysisCardStyle.summaryItem}>
          <div className={drawdonwAnalysisCardStyle.label}>Period Return :</div>
          <PriceBadge price={{ today: meta?.periodReturn ?? "0.00" }} />
        </div>
      </div>

      <div className={drawdonwAnalysisCardStyle.zoneContainer}>
        <div className={drawdonwAnalysisCardStyle.zone}>
          <div className={drawdonwAnalysisCardStyle.zoneTitle}>
            Drawdown Zone
          </div>

          <div className={drawdonwAnalysisCardStyle.zoneContent}>
            <div className={drawdonwAnalysisCardStyle.infoItem}>
              <div className={drawdonwAnalysisCardStyle.label}>
                Current Drawdown :
              </div>

              <PriceBadge price={{ today: drawdown?.current ?? "0.00" }} />
            </div>

            <div className={drawdonwAnalysisCardStyle.infoItem}>
              <div className={drawdonwAnalysisCardStyle.label}>
                Max Drawdown :
              </div>

              <PriceBadge price={{ today: drawdown?.max ?? "0.00" }} />
            </div>

            <div className={drawdonwAnalysisCardStyle.infoItem}>
              <div className={drawdonwAnalysisCardStyle.label}>Peak Date :</div>

              <div className={drawdonwAnalysisCardStyle.value}>
                {peak?.date ?? "yyyy-mm-dd"}
              </div>
            </div>

            <div className={drawdonwAnalysisCardStyle.infoItem}>
              <div className={drawdonwAnalysisCardStyle.label}>
                Trough Date :
              </div>

              <div className={drawdonwAnalysisCardStyle.value}>
                {trough?.date ?? "yyyy-mm-dd"}
              </div>
            </div>
          </div>
        </div>

        <div className={drawdonwAnalysisCardStyle.zone}>
          <div className={drawdonwAnalysisCardStyle.zoneTitle}>
            Recovery Zone
          </div>

          <div className={drawdonwAnalysisCardStyle.zoneContent}>
            <div className={drawdonwAnalysisCardStyle.infoItem}>
              <div className={drawdonwAnalysisCardStyle.label}>
                Recovery Date :
              </div>

              <div className={drawdonwAnalysisCardStyle.value}>
                {recovery?.date ?? "yyyy-mm-dd"}
              </div>
            </div>

            <div className={drawdonwAnalysisCardStyle.infoItem}>
              <div className={drawdonwAnalysisCardStyle.label}>
                Recovery Days
              </div>

              <div className={drawdonwAnalysisCardStyle.value}>
                {recovery?.days ?? "00"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawdonwAnalysisCard;
