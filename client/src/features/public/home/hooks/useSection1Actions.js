import { useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";

export const useSection1Actions = () => {
  const navigate = useNavigate();
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
  };
};
