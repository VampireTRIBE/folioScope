import { lazy, Suspense } from "react";

// ! styles
import securityDetailsStyle from "./securitydetails.module.css";

// ! componets
import SecurityNavlink from "../../UI/securityNav/SecurityNavlink";
import SecurityContent from "../portfolioContent/SecurityContent";
import PriceChartShimmer from "../priceChart/PriceChartShimmer";
const PriceChart = lazy(() => import("../priceChart/PriceChart"));

const SecurityDetails = () => {
  return (
    <section className={securityDetailsStyle.securitydetailContainer}>
      <SecurityNavlink />
      <Suspense fallback={<PriceChartShimmer />}>
        <PriceChart />
      </Suspense>
      <SecurityContent />
    </section>
  );
};

export default SecurityDetails;
