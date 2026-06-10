import { useContext, useEffect } from "react";

// ! Syles
import userDashboardOutletStyles from "./userdashboardoutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Components
import PortfolioMetadata from "../layout/portfolioMetaData/PortfolioMetadata";
import PortfolioDetails from "../layout/portfolioDetails/portfolioDetails";

const UserDashboardOutlet = () => {
  const { user } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();

  useEffect(() => {
    if (!user) {
      goToLogin();
    }
  }, [user, goToLogin]);

  return (
    <main className={userDashboardOutletStyles.outlet}>
      <PortfolioMetadata />
      <PortfolioDetails />
    </main>
  );
};

export default UserDashboardOutlet;
