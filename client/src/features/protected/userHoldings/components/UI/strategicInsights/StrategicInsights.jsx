// ! Styles
import strategicInsightsStyles from "./strategicinsights.module.css";

const LightBulbIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={strategicInsightsStyles.icon}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
};

const StrategicInsights = ({
  title = "Strategic Insights",
  insights = [],
}) => {
  return (
    <div className={strategicInsightsStyles.container}>
      <h2 className={strategicInsightsStyles.title}>
        <LightBulbIcon />
        {title}
      </h2>

      <div className={strategicInsightsStyles.content}>
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`${strategicInsightsStyles.card} ${
              insight.type === "overweight"
                ? strategicInsightsStyles.overweight
                : strategicInsightsStyles.underweight
            }`}>
            <div className={strategicInsightsStyles.cardTitle}>
              {insight.name}: {insight.label}
            </div>

            <p className={strategicInsightsStyles.description}>
              Actual: <strong>{insight.actual}%</strong> vs Target:{" "}
              <strong>{insight.target}%</strong>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StrategicInsights;