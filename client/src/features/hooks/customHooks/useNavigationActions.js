import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routes";

export const useNavigationActions = () => {
  const navigate = useNavigate();

  const goToForgotPassword = useCallback(() => {
    navigate(ROUTES.FORGOTPASSWORD);
  }, [navigate]);

  const goToLogin = useCallback(() => {
    navigate(ROUTES.LOGIN);
  }, [navigate]);

  const goToSignup = useCallback(() => {
    navigate(ROUTES.SIGNUP);
  }, [navigate]);

  const gotoHome = useCallback(() => {
    navigate(ROUTES.HOME);
  }, [navigate]);

  const goToSecurityDashbord = useCallback(
    (security) => {
      navigate(ROUTES.SECURITYDASHBORD(security));
    },
    [navigate],
  );

  const goToSendVerificationMail = useCallback(
    (values) => {
      navigate(ROUTES.SENDVERIFICATIONMAIL, {
        state: values,
      });
    },
    [navigate],
  );

  const goToUserDashBord = useCallback(() => {
    navigate(ROUTES.USERDASHBORD, { replace: true });
  }, [navigate]);

  return {
    goToLogin,
    goToForgotPassword,
    goToSignup,
    gotoHome,
    goToSecurityDashbord,
    goToSendVerificationMail,
    goToUserDashBord,
  };
};
