import { useCallback } from "react";
import { useDispatch } from "react-redux";

// ! dispatch actions
import { groupchartRangeFilterStateActions } from "./groupPriceChartState";

export const useGroupChartActions = () => {
  const dispatch = useDispatch();

  const FILTER_CHART_RANGE = useCallback(
    (key) => {
      dispatch(
        groupchartRangeFilterStateActions.GROUP_CHART_FILTER({
          key,
        }),
      );
    },
    [dispatch],
  );

  return {
    FILTER_CHART_RANGE,
  };
};
