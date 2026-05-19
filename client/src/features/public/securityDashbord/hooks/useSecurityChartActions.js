import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { securitychartRangeFilterStateActions } from "../redux/securityPriceChartState";

export const useSecurityChartActions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // =========================
  // TOGGLE ACTION
  // =========================

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

  // =========================
  // NAVIGATION ACTIONS
  // =========================

  return {
    FILTER_CHART_RANGE,
  };
};
