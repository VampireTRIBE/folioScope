import { useContext } from "react";
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
import { useNavGroupChartRange } from "../../hooks/ReactQuery/useQuery";

// ! context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

const PriceChart = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const groupId = `${userData?.groups?.[`level${level}`]?.[gp_id]?._id}`;
  const { FILTER_CHART_RANGE } = useGroupChartActions();
  const active = useSelector(selectActiveGroupChartFilter);

  const { data: groupNavchartRangeData } = useNavGroupChartRange(
    groupId,
    accessToken,
    active,
  );

  const highLowReturn = {
    high: groupNavchartRangeData?.high ?? null,
    low: groupNavchartRangeData?.low ?? null,
    price: { today: groupNavchartRangeData?.periodReturn ?? null },
  };

  const seriesData = groupNavchartRangeData?.series ?? [];

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
