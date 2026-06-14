import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../constants/routes";

export const useNavigationActions = () => {
  const navigate = useNavigate();

  // =========================
  // NAVIGATION ACTIONS
  // =========================

  const goToLogin = useCallback(() => {
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const goToSignup = useCallback(() => {
    navigate(ROUTES.SIGNUP);
  }, [navigate]);

  return {
    goToLogin,
    goToSignup,
  };
};
