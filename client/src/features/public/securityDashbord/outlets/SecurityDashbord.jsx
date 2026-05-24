// ! components
import SecurityDetails from "../components/layout/securityDetails/SecurityDetails";
import SecurityMetadata from "../components/layout/securityMetadata/SecurityMetadata";

// ! Styles
import securityDashbordStyle from "./securitydashbord.module.css";

const SecurityDashbord = () => {
  return (
    <main className={securityDashbordStyle.main}>
      <SecurityMetadata />
      <SecurityDetails />
    </main>
  );
};

export default SecurityDashbord;
