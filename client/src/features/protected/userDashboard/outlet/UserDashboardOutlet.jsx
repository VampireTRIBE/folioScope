import { useContext, useEffect } from "react";
import userDashboardOutletStyles from "./userdashboardoutlet.module.css";
import { AuthenticationContext } from "../../../../context/authenticationContext";
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

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
      UserDashboardOutlet
    </main>
  );
};

export default UserDashboardOutlet;
