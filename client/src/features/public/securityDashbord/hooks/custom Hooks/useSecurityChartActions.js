import { useCallback } from "react";
import { useDispatch } from "react-redux";

// ! dispatch actions
import { securitychartRangeFilterStateActions } from "../../redux/securityPriceChartState";

export const useSecurityChartActions = () => {
  const dispatch = useDispatch();

  const FILTER_CHART_RANGE = useCallback(
    (key) => {
      dispatch(
        securitychartRangeFilterStateActions.SECURITY_CHART_FILTER({
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
