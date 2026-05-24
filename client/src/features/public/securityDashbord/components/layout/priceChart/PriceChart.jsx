import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";

// ! componets
import PriceChartCurve from "../../../../../../components/layout/public/priceChartCurve/PriceChartCurve";
import PriceChartFilter from "../../../../../../components/layout/public/priceChartFilter/PriceChartFilter";
import PriceChartHead from "../../../../../../components/layout/public/priceChartHead/PriceChartHead";

// ! styles
import priceChartStyle from "./pricechart.module.css";

// ! selectors
import { selectActiveSecurityChartFilter } from "../../../redux/securityPriceChartSelectors";

// ! Custom Hooks

import { useSecurityChartActions } from "../../../hooks/custom Hooks/useSecurityChartActions";

// ! tanStack Query Hooks
import { useChartRange } from "../../../../../hooks/RKT Query/usePricesQuery";


const PriceChart = () => {
  const { securityID } = useParams();
  const { FILTER_CHART_RANGE } = useSecurityChartActions();
  const active = useSelector(selectActiveSecurityChartFilter);
  const { data: chartRangeData } = useChartRange(securityID, active);

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
