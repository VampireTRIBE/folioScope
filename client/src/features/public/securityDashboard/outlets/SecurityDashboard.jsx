// ! components
import SecurityDetails from "../components/layout/securityDetails/SecurityDetails";
import SecurityMetadata from "../components/layout/securityMetadata/SecurityMetadata";

// ! Styles
import securityDashboardStyle from "./securitydashboard.module.css";

const SecurityDashboard = () => {
  return (
    <main className={securityDashboardStyle.main}>
      <SecurityMetadata />
      <SecurityDetails />
    </main>
  );
};

export default SecurityDashboard;
