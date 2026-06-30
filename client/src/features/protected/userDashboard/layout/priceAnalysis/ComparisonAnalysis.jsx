import { useParams } from "react-router-dom";
import { useContext, useMemo } from "react";

// ! styles
import comparisonAnalysisStyle from "./comparisonAnalysis.module.css";

// ! UI Components
import XirrComparisionAnalysisCard from "../../../../../components/layout/public/analysis/comparisonAnalysis/xirrComparision/XirrComparisionAnalysisCard";
import NavComparisionAnalysisCard from "../../../../../components/layout/public/analysis/comparisonAnalysis/navComparisonAnalysis/NavComparisionAnalysisCard";

// ! tanStack Query Hook
import {
  useNavComparision,
  useXirrComparision,
} from "../../hooks/ReactQuery/useQuery";

// ! context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

// ! Session Storage Utils
import { usePublicSecurities } from "../../../../../hooks/RTK Query Hooks/sessionStorage";

const formatNumber = (value) => {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(2)
    : "0.00";
};

const formatDate = (value) => {
  return value ? new Date(value).toISOString().split("T")[0] : "yyyy-mm-dd";
};

const formatChartDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

const buildNormalizeNavSeries = (navComparisionData, indexName) => {
  const normalizeNavsSeries =
    navComparisionData?.data?.normalizeNavsSeries || {};

  const groupSeries = [];
  const indexSeries = [];

  Object.entries(normalizeNavsSeries).forEach(([date, value]) => {
    const time = formatChartDate(date);

    if (typeof value?.group === "number") {
      groupSeries.push({
        time,
        value: value.group,
      });
    }

    if (typeof value?.index === "number") {
      indexSeries.push({
        time,
        value: value.index,
      });
    }
  });

  return [
    {
      name: "Group",
      type: "group",
      data: groupSeries,
    },
    {
      name: indexName || "Index",
      type: "index",
      data: indexSeries,
    },
  ];
};

const buildNavStandaloneStats = ({ navComparisionData, groupId, indexId }) => {
  const standaloneData =
    navComparisionData?.data?.navBasedAnalytics?.standalone || {};

  const finalData = {
    group: [],
    index: [],
  };

  for (const [entityId, periodDataObj] of Object.entries(standaloneData)) {
    let type = null;

    if (entityId === groupId) {
      type = "group";
    }

    if (entityId === indexId) {
      type = "index";
    }

    if (!type) continue;

    for (const [period, periodData] of Object.entries(periodDataObj || {})) {
      const drawdown = periodData?.drawdown || {};

      finalData[type].push({
        meta: {
          id: entityId,
          type,
          period,
          periodReturn: formatNumber(periodData?.return),
        },

        drawdown: {
          current: formatNumber(drawdown?.current),
          max: formatNumber(drawdown?.max),
        },

        peak: {
          date: formatDate(drawdown?.peakDate),
        },

        trough: {
          date: formatDate(drawdown?.troughDate),
        },

        recovery: {
          date: formatDate(drawdown?.recoveryDate),
          days: drawdown?.recoveryDays ?? "0.00",
        },
      });
    }
  }

  return finalData;
};

const buildNavComparisionCards = (navComparisionData) => {
  const comparisonData =
    navComparisionData?.data?.navBasedAnalytics?.comparison || {};

  return Object.entries(comparisonData).map(([period, data]) => {
    const excessDrawdown = data?.excessDrawdown || {};

    return {
      meta: {
        period,
        periodReturn: formatNumber(data?.excessReturn),
      },

      drawdown: {
        current: formatNumber(excessDrawdown?.current),
        max: formatNumber(excessDrawdown?.max),
      },
    };
  });
};

const ComparisonAnalysis = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);

  const groupId = userData?.groups?.[`level${level}`]?.[gp_id]?._id || "";

  const { data: { INDEX = {} } = {} } = usePublicSecurities();

  const indexName = "NIFTY 50";
  const indexId = INDEX[indexName] || "";

  const {
    data: xirrComparisionData,
    isPending: isPendingxirrComparision,
    isError: isErrorxirrComparision,
    error: errorxirrComparision,
  } = useXirrComparision(groupId, indexId, accessToken);

  const {
    data: navComparisionData,
  } = useNavComparision(groupId, indexId, accessToken);

  const safeXirrComparisionData = useMemo(() => {
    return {
      indexName: indexName || "N/A",
      xirrAnalysis: {
        groupXirr: xirrComparisionData?.data?.xirrAnalysis?.groupXirr ?? null,
        indexXirr: xirrComparisionData?.data?.xirrAnalysis?.indexXirr ?? null,
        alpha: xirrComparisionData?.data?.xirrAnalysis?.alpha ?? null,
      },
    };
  }, [xirrComparisionData, indexName]);

  const navStandaloneStats = useMemo(() => {
    return buildNavStandaloneStats({
      navComparisionData,
      groupId,
      indexId,
    });
  }, [navComparisionData, groupId, indexId]);

  const comparision = useMemo(() => {
    return buildNavComparisionCards(navComparisionData);
  }, [navComparisionData]);

  const normalizedNavSeries = useMemo(() => {
    return buildNormalizeNavSeries(navComparisionData, indexName);
  }, [navComparisionData, indexName]);

  return (
    <div id="comparison" className={comparisonAnalysisStyle.container}>
      <h3 className={comparisonAnalysisStyle.title}>Comparison Analysis</h3>

      <XirrComparisionAnalysisCard
        xirrComparisionStats={safeXirrComparisionData}
        isLoading={isPendingxirrComparision}
        isError={isErrorxirrComparision}
        error={errorxirrComparision}
      />

      <NavComparisionAnalysisCard
        standaloneStats={navStandaloneStats}
        comparision={comparision}
        indexName={indexName}
        normalizedNavSeries={normalizedNavSeries}
      />
    </div>
  );
};

export default ComparisonAnalysis;
