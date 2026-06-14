import { lazy, Suspense } from "react";

// ! styles
import portfolioDetailsStyle from "./portfoliodetails.module.css";

// ! components
import PortfolioNavlink from "../portfolioNav/PortfolioNavlink";
import PriceChartShimmer from "../priceChart/PriceChartShimmer";

import SecurityContent from "../../../../public/securityDashboard/components/layout/securityContent/SecurityContent";
import PortfolioContent from "../portfolioContent/PortfolioContent";
const PriceChart = lazy(() => import("../priceChart/PriceChart"));

const PortfolioDetails = () => {
  return (
    <section className={portfolioDetailsStyle.portfoliodetailContainer}>
      <PortfolioNavlink />

      <Suspense fallback={<PriceChartShimmer />}>
        <PriceChart />
      </Suspense>

      <PortfolioContent />
    </section>
  );
};

export default PortfolioDetails;
