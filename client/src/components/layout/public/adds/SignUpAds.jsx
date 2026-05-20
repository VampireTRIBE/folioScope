import React from "react";
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";
import Button from "../../../UI/buttons/Button";
import singupAdsStyles from "./SignupAds.module.css";

const SignupAds = () => {
  const { goToSignup } = useNavigationActions();

  const buttonATTR = {
    text: "Create Account",
    varient: "buttonBlackSquare",
    onClick: goToSignup,
  };
  return (
    <div className={singupAdsStyles.container}>
      <div className={singupAdsStyles.text}>
        Singup To Start your Investments jounery and grow with us...
      </div>
      <Button {...buttonATTR} />
    </div>
  );
};

export default React.memo(SignupAds);
