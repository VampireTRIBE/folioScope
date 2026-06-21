import { lazy, Suspense, useMemo } from "react";
import { Link } from "react-router-dom";

// ! Styles
import navComparisionAnalysisCardStyles from "./navanalysiscard.module.css";

// ! UI Components
import NavCard from "./navCard/NavCard";
import DrawdownAnalysisCard from "../../DrawdownAnalysisCard";
import NavChartShimmer from "../../../../../../features/protected/userDashboard/layout/navChart/NavChartShimmer";

const NavChart = lazy(
  () =>
    import("../../../../../../features/protected/userDashboard/layout/navChart/NavChart"),
);

const PERIODS = ["3 Months", "1 Year", "3 Year", "Max"];

const NavComparisionAnalysisCard = ({
  standaloneStats = null,
  comparision = [],
  indexName = null,
  normalizedNavSeries = [],
}) => {
  const paddedComparision = useMemo(() => {
    const safeComparision = Array.isArray(comparision) ? comparision : [];

    if (safeComparision.length >= 4) {
      return safeComparision;
    }

    const missingItems = PERIODS.slice(safeComparision.length).map(
      (period) => ({
        meta: {
          period,
          periodReturn: "0.00",
        },
        drawdown: {
          current: "0.00",
          max: "0.00",
        },
      }),
    );

    return [...safeComparision, ...missingItems];
  }, [comparision]);

  return (
    <div className={navComparisionAnalysisCardStyles.card}>
      <h4 className={navComparisionAnalysisCardStyles.cardTitle}>
        NAV Analysis
      </h4>

      <div className={navComparisionAnalysisCardStyles.cardSubtitleContainer}>
        <h4 className={navComparisionAnalysisCardStyles.cardSubtitle}>Vs</h4>

        <span className={navComparisionAnalysisCardStyles.cardSubtitleIndex}>
          {indexName ?? "N/A"}
        </span>
      </div>

      <Suspense fallback={<NavChartShimmer />}>
        <NavChart seriesData={normalizedNavSeries} indexName={indexName} />
      </Suspense>

      <div className={navComparisionAnalysisCardStyles.comparisionCard}>
        <div className={navComparisionAnalysisCardStyles.cardTitle2}>
          Comparison Stats
        </div>

        <div className={navComparisionAnalysisCardStyles.cardContent}>
          {paddedComparision.map((period, indx) => (
            <NavCard
              key={period?.meta?.period || indx}
              meta={period?.meta}
              drawdown={period?.drawdown}
            />
          ))}
        </div>
      </div>

      <DrawdownAnalysisCard
        title="Standalone Group Stats"
        drawdownDetails={standaloneStats?.group || []}
      />

      <DrawdownAnalysisCard
        title="Standalone Index Stats"
        drawdownDetails={standaloneStats?.index || []}
      />

      <div className={navComparisionAnalysisCardStyles.disclaimer}>
        <div className={navComparisionAnalysisCardStyles.disclaimerDetail}>
          <span>Disclaimer : </span>
          NAV analysis includes weekends and holidays with carried-forward
          prices.
          <Link to="/disclaimer/nav-comparision"> Learn More</Link>
        </div>
      </div>
    </div>
  );
};

export default NavComparisionAnalysisCard;
