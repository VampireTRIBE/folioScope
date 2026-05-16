import securityDetailsStyle from "./securitydetails.module.css";
import SecurityNavlink from "../../UI/securityNav/SecurityNavlink";
import PriceChart from "../priceChart/PriceChart";

const SecurityDetails = () => {
  return (
    <section className={securityDetailsStyle.securitydetailContainer}>
      <SecurityNavlink />
      <PriceChart />
    </section>
  );
};

export default SecurityDetails;
