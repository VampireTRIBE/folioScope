import { useCallback} from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../../constants/routes";

export const useSection1Actions = () => {
  const navigate = useNavigate();
  // =========================
  // NAVIGATION ACTIONS
  // =========================

  const goToSecurityDashboard = useCallback(
    (security) => {
      navigate(ROUTES.SECURITYDASHBOARD(security));
    },
    [navigate],
  );
  return {
    goToSecurityDashboard,
  };
};
