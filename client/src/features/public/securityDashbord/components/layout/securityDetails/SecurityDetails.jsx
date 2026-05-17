import { lazy, Suspense } from "react";

import securityDetailsStyle from "./securitydetails.module.css";
import SecurityNavlink from "../../UI/securityNav/SecurityNavlink";
import SecurityContent from "../securityContent/SecurityContent";
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
