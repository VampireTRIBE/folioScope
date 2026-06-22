import { useParams } from "react-router-dom";
import { useContext, useEffect } from "react";

// ! Syles
import userProfileOutletStyles from "./userprofileoutlet.module.css";

// ! context
import { AuthenticationContext } from "../../../../context/authenticationContext";

// ! Custom Hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

// ! Tanstck Query

// ! Layout Components

const UserProfileOutlet = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const { goToLogin } = useNavigationActions();

  useEffect(() => {
    if (!accessToken) {
      goToLogin();
    }
  }, [accessToken, goToLogin]);

  return (
    <main className={userProfileOutletStyles.outlet}>
      <h2>profile Page outlet</h2>
    </main>
  );
};

export default UserProfileOutlet;
