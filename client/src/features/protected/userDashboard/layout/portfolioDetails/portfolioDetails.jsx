import { lazy, Suspense } from "react";

// ! styles
import portfolioDetailsStyle from "./portfoliodetails.module.css";

// ! componets
import PortfolioNavlink from "../portfolioNav/PortfolioNavlink";
import PriceChartShimmer from "../priceChart/PriceChartShimmer";
import PriceChart from "../priceChart/PriceChart";
import SecurityContent from "../../../../public/securityDashbord/components/layout/securityContent/SecurityContent";
import PortfolioContent from "../portfolioContent/PortfolioContent";

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
