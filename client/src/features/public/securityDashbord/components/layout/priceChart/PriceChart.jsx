import PriceChartCurve from "../../../../../../components/layout/public/priceChartCurve/PriceChartCurve";
import PriceChartFilter from "../../../../../../components/layout/public/priceChartFilter/PriceChartFilter";
import PriceChartHead from "../../../../../../components/layout/public/priceChartHead/PriceChartHead";
import priceChartStyle from "./pricechart.module.css";

const PriceChart = () => {
  return (
    <div className={priceChartStyle.container}>
      <PriceChartHead />
      <PriceChartCurve />
      <PriceChartFilter />
    </div>
  );
};

export default PriceChart;
