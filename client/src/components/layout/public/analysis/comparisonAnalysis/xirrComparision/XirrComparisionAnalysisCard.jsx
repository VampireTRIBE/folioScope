import { Link } from "react-router-dom";

// ! Styles
import xirrComparisionAnalysisCardStyles from "./xirranalysiscard.module.css";

// ! UI Components
import XirrCard from "./xirrCard/XirrCard";

const XirrComparisionAnalysisCard = ({ xirrComparisionStats }) => {
  return (
    <div className={xirrComparisionAnalysisCardStyles.card}>
      <h4 className={xirrComparisionAnalysisCardStyles.cardTitle}>
        Xirr Analysis
      </h4>
      <div className={xirrComparisionAnalysisCardStyles.cardContent}>
        <XirrCard xirrComparisionStats={xirrComparisionStats} />
      </div>
      <div className={xirrComparisionAnalysisCardStyles.disclaimer}>
        <div className={xirrComparisionAnalysisCardStyles.disclaimerDetail}>
          <span>Disclaimer : </span> Xirr Comparison Analysis includes Lifetime
          Cashflows of Group and synthesized with Index.
          <Link to={"/disclaimer/xirr-comparision"}> Learn More</Link>
        </div>
      </div>
    </div>
  );
};

export default XirrComparisionAnalysisCard;
