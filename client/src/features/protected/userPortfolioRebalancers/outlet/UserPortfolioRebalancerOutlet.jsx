import { useContext, useEffect } from "react";

// ! Syles
import userPortfolioBalancerOutletStyles from "./userportfolioreblanceroutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Layout Components
import NewRebalancerForm from "../layout/newRebalancer/NewRebalancerForm";

const UserPortfolioRebalencerOutlet = () => {
  const { accessToken } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  return (
    <main className={userPortfolioBalancerOutletStyles.outlet}>
      <NewRebalancerForm />
    </main>
  );
};

export default UserPortfolioRebalencerOutlet;
