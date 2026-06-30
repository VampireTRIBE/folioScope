import { Link } from "react-router-dom";

// ! Styles
import analysisCardStyle from "./analysisCard.module.css";

// ! Components
import DrawdownPeriodCard from "./drawdownCard/DrawdownAnalysisCard";

const DrawdownAnalysisCard = ({
  title = null,
  drawdownDetails = [],
  disclaimer = false,
}) => {
  const periods = ["3 Months", "1 Year", "3 Year", "Max"];

  drawdownDetails = drawdownDetails.map((item) => ({
    ...item,
    isDummy: false,
  }));

  if (drawdownDetails.length < 4) {
    const missingItems = periods
      .slice(drawdownDetails.length)
      .map((period) => ({
        meta: { period },
        isDummy: true,
      }));

    drawdownDetails.push(...missingItems);
  }

  return (
    <div className={analysisCardStyle.card}>
      <h4 className={analysisCardStyle.cardTitle}>
        {title || "Drawdown Analysis"}
      </h4>
      <div className={analysisCardStyle.cardContent}>
        {drawdownDetails.map((period, indx) => (
          <DrawdownPeriodCard key={period?.id ?? indx} {...period} />
        ))}
      </div>
      {disclaimer && (
        <div className={analysisCardStyle.disclaimer}>
          <div className={analysisCardStyle.disclaimerDetail}>
            <span>Disclaimer : </span> Drawdown analysis includes weekends and
            holidays with carried-forward prices.
            <Link to={"/disclaimer/drawdown"}> Learn More</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawdownAnalysisCard;
