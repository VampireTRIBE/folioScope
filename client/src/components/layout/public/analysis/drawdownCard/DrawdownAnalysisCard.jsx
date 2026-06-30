import PriceBadge from "../../priceBadge/PriceBadge";
import drawdownAnalysisCardStyle from "./drawdownanalysiscard.module.css";

const DrawdownAnalysisCard = ({
  meta,
  drawdown,
  peak,
  trough,
  recovery,
  isDummy,
}) => {
  return (
    <div
      className={`${drawdownAnalysisCardStyle.analysisContainer} ${
        isDummy ? drawdownAnalysisCardStyle.dummy : ""
      }`}>
      <div className={drawdownAnalysisCardStyle.summaryContainer}>
        <div className={drawdownAnalysisCardStyle.summaryItem}>
          <div className={drawdownAnalysisCardStyle.label}>Period :</div>
          <div className={drawdownAnalysisCardStyle.value}>
            {meta?.period ?? "N/A"}
          </div>
        </div>

        <div className={drawdownAnalysisCardStyle.summaryItem}>
          <div className={drawdownAnalysisCardStyle.label}>Period Return :</div>
          <PriceBadge price={{ today: meta?.periodReturn ?? "0.00" }} />
        </div>
      </div>

      <div className={drawdownAnalysisCardStyle.zoneContainer}>
        <div className={drawdownAnalysisCardStyle.zone}>
          <div className={drawdownAnalysisCardStyle.zoneTitle}>
            Drawdown Zone
          </div>

          <div className={drawdownAnalysisCardStyle.zoneContent}>
            <div className={drawdownAnalysisCardStyle.infoItem}>
              <div className={drawdownAnalysisCardStyle.label}>
                Current Drawdown :
              </div>

              <PriceBadge price={{ today: drawdown?.current ?? "0.00" }} />
            </div>

            <div className={drawdownAnalysisCardStyle.infoItem}>
              <div className={drawdownAnalysisCardStyle.label}>
                Max Drawdown :
              </div>

              <PriceBadge price={{ today: drawdown?.max ?? "0.00" }} />
            </div>

            <div className={drawdownAnalysisCardStyle.infoItem}>
              <div className={drawdownAnalysisCardStyle.label}>Peak Date :</div>

              <div className={drawdownAnalysisCardStyle.value}>
                {peak?.date ?? "yyyy-mm-dd"}
              </div>
            </div>

            <div className={drawdownAnalysisCardStyle.infoItem}>
              <div className={drawdownAnalysisCardStyle.label}>
                Trough Date :
              </div>

              <div className={drawdownAnalysisCardStyle.value}>
                {trough?.date ?? "yyyy-mm-dd"}
              </div>
            </div>
          </div>
        </div>

        <div className={drawdownAnalysisCardStyle.zone}>
          <div className={drawdownAnalysisCardStyle.zoneTitle}>
            Recovery Zone
          </div>

          <div className={drawdownAnalysisCardStyle.zoneContent}>
            <div className={drawdownAnalysisCardStyle.infoItem}>
              <div className={drawdownAnalysisCardStyle.label}>
                Recovery Date :
              </div>

              <div className={drawdownAnalysisCardStyle.value}>
                {recovery?.date ?? "yyyy-mm-dd"}
              </div>
            </div>

            <div className={drawdownAnalysisCardStyle.infoItem}>
              <div className={drawdownAnalysisCardStyle.label}>
                Recovery Days
              </div>

              <div className={drawdownAnalysisCardStyle.value}>
                {recovery?.days ?? "00"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawdownAnalysisCard;
