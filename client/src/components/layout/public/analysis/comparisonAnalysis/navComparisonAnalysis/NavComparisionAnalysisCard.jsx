import { Link } from "react-router-dom";

// ! Styles
import navComparisionAnalysisCardStyles from "./navanalysiscard.module.css";

// ! UI Components
import NavCard from "./xirrCard/NavCard";

const NavComparisionAnalysisCard = ({ xirrComparisionDetails = [] }) => {
  return (
    <div className={navComparisionAnalysisCardStyles.card}>
      <h4 className={navComparisionAnalysisCardStyles.cardTitle}>
        NAV Analysis
      </h4>
      <div className={navComparisionAnalysisCardStyles.cardContent}>
        <NavCard />
      </div>
      <div className={navComparisionAnalysisCardStyles.disclaimer}>
        <div className={navComparisionAnalysisCardStyles.disclaimerDetail}>
          <span>Disclaimer : Disclaimer : </span> NAV analysis includes weekends
          and holidays with carried-forward prices.
          <Link to={"/disclaimer/nav-comparision"}> Learn More</Link>
        </div>
      </div>
    </div>
  );
};

export default NavComparisionAnalysisCard;
