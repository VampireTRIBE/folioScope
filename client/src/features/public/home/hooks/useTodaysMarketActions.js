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
  };
};
