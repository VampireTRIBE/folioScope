import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";
import { todaysMarketToggleActions } from "../redux/todaysMarketsState";
import { useDispatch } from "react-redux";

export const useTodaysMarketActions = () => {
  const navigate = useNavigate();
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

  // =========================
  // NAVIGATION ACTIONS
  // =========================

  const goToSecurityDashbord = useCallback(
    (security) => {
      navigate(ROUTES.SECURITYDASHBORD(security));
    },
    [navigate],
  );
  return {
    goToSecurityDashbord,
    toggleFilter,
    toggleSubFilter,
  };
};
