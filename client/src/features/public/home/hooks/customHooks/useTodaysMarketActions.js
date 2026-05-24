import { useCallback } from "react";
import { todaysMarketToggleActions } from "../../redux/todaysMarketsState";
import { useDispatch } from "react-redux";

export const useTodaysMarketActions = () => {
  const dispatch = useDispatch();

  // =========================
  // TOGGLE ACTION
  // =========================

  const toggleSubFilter = useCallback(
    (category, subCategory, target) => {
      dispatch(
        todaysMarketToggleActions.SUB_FILTER_TOGGLE({
          category,
          subCategory,
          target,
        }),
      );
    },
    [dispatch],
  );

  const toggleFilter = useCallback(
    (key) => {
      dispatch(
        todaysMarketToggleActions.FILTER_TOGGLE({
          key,
        }),
      );
    },
    [dispatch],
  );

  return {
    toggleFilter,
    toggleSubFilter,
  };
};
