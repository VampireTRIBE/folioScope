import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// ! components
import PriceChartCurve from "../../../../../components/layout/public/priceChartCurve/PriceChartCurve";
import PriceChartHead from "../../../../../components/layout/public/priceChartHead/PriceChartHead";
import PriceChartFilter from "../../../../../components/layout/public/priceChartFilter/PriceChartFilter";

// ! styles
import priceChartStyle from "./pricechart.module.css";

// ! selectors
import { selectActiveGroupChartFilter } from "../../redux/groupPriceChartSelectors";

// ! Custom Hooks
import { useGroupChartActions } from "../../redux/dispatchActions";

// ! tanStack Query Hooks

const PriceChart = () => {
  const { securityID } = useParams();
  const { FILTER_CHART_RANGE } = useGroupChartActions();
  const active = useSelector(selectActiveGroupChartFilter);

  const chartRangeData = null;
  const highLowReturn = {
    high: chartRangeData?.high ?? null,
    low: chartRangeData?.low ?? null,
    price: { today: chartRangeData?.periodReturn ?? null },
  };

  const seriesData = chartRangeData?.series ?? [];

  const buttonArray = [
    {
      id: "Week",
      text: "W",
      varient: active === "W" ? "chartFilterActive" : "chartFilter",
    },
    {
      id: "Month",
      text: "M",
      varient: active === "M" ? "chartFilterActive" : "chartFilter",
    },
    {
      id: "Year",
      text: "Y",
      varient: active === "Y" ? "chartFilterActive" : "chartFilter",
    },
    {
      id: "3Year",
      text: "3Y",
      varient: active === "3Y" ? "chartFilterActive" : "chartFilter",
    },
    {
      id: "Max",
      text: "Max",
      varient: active === "MAX" ? "chartFilterActive" : "chartFilter",
    },
  ];

  return (
    <div className={priceChartStyle.container}>
      <PriceChartHead {...highLowReturn} />
      <PriceChartCurve data={seriesData} />
      <PriceChartFilter
        active={active}
        action={FILTER_CHART_RANGE}
        buttonArray={buttonArray}
      />
    </div>
  );
};

export default PriceChart;
