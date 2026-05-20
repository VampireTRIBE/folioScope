import analysisStyle from "./analysis.module.css";

const Analysis = () => {
  return (
    <div id="analysis" className={analysisStyle.container}>
      <h3 className={analysisStyle.title}>Price Analysis</h3>

      <div className={analysisStyle.type}>
        <h4 className={analysisStyle.subTitle}>
          Drawdown Analysis
        </h4>

        <div className={analysisStyle.analysisContainer}>
          <div className={analysisStyle.summaryContainer}>
            <div className={analysisStyle.summaryItem}>
              <div className={analysisStyle.label}>
                Period :
              </div>
              <div className={analysisStyle.value}>
                3 Months
              </div>
            </div>

            <div className={analysisStyle.summaryItem}>
              <div className={analysisStyle.label}>
                Period Return :
              </div>
              <div className={analysisStyle.value}>
                0.00%
              </div>
            </div>
          </div>

          <div className={analysisStyle.zoneContainer}>
            <div className={analysisStyle.zone}>
              <div className={analysisStyle.zoneTitle}>
                Drawdown Zone
              </div>

              <div className={analysisStyle.zoneContent}>
                <div className={analysisStyle.infoItem}>
                  <div className={analysisStyle.label}>
                    Current Drawdown :
                  </div>

                  <div className={analysisStyle.value}>
                    0.00%
                  </div>
                </div>

                <div className={analysisStyle.infoItem}>
                  <div className={analysisStyle.label}>
                    Max Drawdown :
                  </div>

                  <div className={analysisStyle.value}>
                    0.00%
                  </div>
                </div>

                <div className={analysisStyle.infoItem}>
                  <div className={analysisStyle.label}>
                    Peak Date :
                  </div>

                  <div className={analysisStyle.value}>
                    Date Value
                  </div>
                </div>

                <div className={analysisStyle.infoItem}>
                  <div className={analysisStyle.label}>
                    Trough Date :
                  </div>

                  <div className={analysisStyle.value}>
                    Date Value
                  </div>
                </div>
              </div>
            </div>

            <div className={analysisStyle.zone}>
              <div className={analysisStyle.zoneTitle}>
                Recovery Zone
              </div>

              <div className={analysisStyle.zoneContent}>
                <div className={analysisStyle.infoItem}>
                  <div className={analysisStyle.label}>
                    Recovery Date :
                  </div>

                  <div className={analysisStyle.value}>
                    Date Value
                  </div>
                </div>

                <div className={analysisStyle.infoItem}>
                  <div className={analysisStyle.label}>
                    Recovery Days
                  </div>

                  <div className={analysisStyle.value}>
                    Days Value
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;