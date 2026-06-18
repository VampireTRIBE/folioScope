import { useCallback } from "react";
import { useDispatch } from "react-redux";

// ! dispatch actions
import { groupchartRangeFilterStateActions } from "./groupPriceChartState";
import { groupFormStateActions } from "./groupFormState";

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

export const useGroupFormActions = () => {
  const dispatch = useDispatch();

  const ACTIVE_GROUP_FORM = useCallback(
    (key) => {
      dispatch(
        groupFormStateActions.GROUP_FORM_FILTER({
          key,
        }),
      );
    },
    [dispatch],
  );

  const ACTIVE_GROUP_FORM_RESET = useCallback(() => {
    dispatch(groupFormStateActions.GROUP_FORM_FILTER_RESET());
  }, [dispatch]);

  return {
    ACTIVE_GROUP_FORM,
    ACTIVE_GROUP_FORM_RESET,
  };
};
