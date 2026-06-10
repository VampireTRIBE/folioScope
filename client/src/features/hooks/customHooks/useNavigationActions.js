import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../routes/routes";

export const useNavigationActions = () => {
  const navigate = useNavigate();

  const goToForgotPassword = useCallback(() => {
    navigate(ROUTES.FORGOTPASSWORD, { replace: true });
  }, [navigate]);

  const goToSubmitOtp = useCallback(
    (email) => {
      navigate(ROUTES.SUBMITOTP, { state: { email }, replace: true });
    },
    [navigate],
  );

  const goToConfirmPassword = useCallback(
    (email) => {
      navigate(ROUTES.CONFIRMPASSWORD, { state: { email }, replace: true });
    },
    [navigate],
  );

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

  const goToUserProfile = useCallback(() => {
    navigate(ROUTES.USERPROFILE);
  }, [navigate]);

  return {
    goToLogin,
    goToForgotPassword,
    goToSubmitOtp,
    goToConfirmPassword,
    goToSignup,
    gotoHome,
    goToSecurityDashbord,
    goToSendVerificationMail,
    goToUserDashBord,
    goToUserProfile,
  };
};
