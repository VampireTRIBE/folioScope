import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";

// ! Syles
import userHoldingsOutletStyles from "./userholdingsoutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstck Query

// ! Layout Components
import HoldingsContainer from "../layout/holdingsContainer/HoldingsContainer";
import CostStructure from "../components/UI/expanseCard/ExpenseCard";
import HoldingSummary from "../components/UI/holdingSummary/HoldingSummary";
import StrategicInsights from "../components/UI/strategicInsights/StrategicInsights";

const UserHoldingsOutlet = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  return (
    <main className={userHoldingsOutletStyles.outlet}>
      <div className={userHoldingsOutletStyles.layout}>
        <HoldingSummary />
        <CostStructure />
        <StrategicInsights />
      </div>
      <HoldingsContainer />
    </main>
  );
};

export default UserHoldingsOutlet;
