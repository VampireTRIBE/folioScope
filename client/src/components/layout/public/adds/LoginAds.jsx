import React from "react";
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";
import Button from "../../../UI/buttons/Button";
import loginAdsStyles from "./loginAds.module.css";

const LoginAds = () => {
  const { goToLogin } = useNavigationActions();

  const buttonATTR = {
    text: "Login To Your Account",
    varient: "buttonBlackSquare",
    onClick: goToLogin,
  };
  return (
    <div className={loginAdsStyles.container}>
      <div className={loginAdsStyles.text}>
        Login To See Updated Analysis and Investment Value of Your
        Portfolio.....
      </div>
      <Button {...buttonATTR} />
    </div>
  );
};

export default React.memo(LoginAds);
