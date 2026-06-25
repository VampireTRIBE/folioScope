import { useContext, useEffect, useMemo, useRef, useState } from "react";

// ! Syles
import userPortfolioBalancerOutletStyles from "./userportfolioreblanceroutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstck Query

// ! Layout Components
import FilterHoldings from "../layout/filterHoldings/FilterHoldings";
import { useFormDataActions } from "../hooks/customHooks/useFormData";

const UserPortfolioRebalencerOutlet = () => {
  const { accessToken, userData } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  return (
    <main className={userPortfolioBalancerOutletStyles.outlet}>
      <div className={userPortfolioBalancerOutletStyles.filterLayout}>
        Reblancers List
      </div>
    </main>
  );
};

export default UserPortfolioRebalencerOutlet;
