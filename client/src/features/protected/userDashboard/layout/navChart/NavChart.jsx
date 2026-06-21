// ! components
import PriceChartCurveDoubleSeries from "../../../../../components/layout/public/priceChartCurve/priceChartCurveDoubleSeries";

// ! styles
import navChartStyle from "./navchart.module.css";

const NavChart = ({ seriesData = [], indexName = "Index" }) => {
  return (
    <div className={navChartStyle.container}>
      <div className={navChartStyle.header}>
        <div className={navChartStyle.title}>Normalized NAV Series</div>

        <div className={navChartStyle.legend}>
          <div className={navChartStyle.legendItem}>
            <span
              className={`${navChartStyle.legendDot} ${navChartStyle.groupDot}`}
            />
            <span>Group</span>
          </div>

          <div className={navChartStyle.legendItem}>
            <span
              className={`${navChartStyle.legendDot} ${navChartStyle.indexDot}`}
            />
            <span>{indexName ?? "Index"}</span>
          </div>
        </div>
      </div>

      <PriceChartCurveDoubleSeries data={seriesData} />
    </div>
  );
};

export default NavChart;
