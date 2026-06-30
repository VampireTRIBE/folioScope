import { useMemo } from "react";
import { useParams } from "react-router-dom";

// ! styles
import drawdownAnalysisStyle from "./drawdownanalysis.module.css";

// ! Components
import DrawdownAnalysisCard from "../../../../../../components/layout/public/analysis/DrawdownAnalysisCard";

// ! tanStack Query Hook
import { useSecurityDrawdown } from "../../../hooks/RTK Query/useSecurityQuery";
import { usePublicSecurities } from "../../../../../../hooks/RTK Query Hooks/sessionStorage";

// ! utils
import {
  getSecurityId,
  getSecurityLabel,
  normalizeSecuritiesList,
} from "../../../../../../utils/sessionStorage/securityListTransforms";

const DrawdownAnalysis = () => {
  const { securityID } = useParams();
  const { data: securities } = usePublicSecurities();

  const drawdownSecurityID = useMemo(() => {
    const securityParam = securityID?.trim();
    if (!securityParam) return "";
    const normalizedSecurityParam = securityParam.toLowerCase();
    const security = normalizeSecuritiesList(securities).find((item) => {
      const label = String(getSecurityLabel(item)).toLowerCase();
      const id = String(getSecurityId(item));
      return label === normalizedSecurityParam || id === securityParam;
    });
    return getSecurityId(security);
  }, [securities, securityID]);

  const { data: drawdownData } = useSecurityDrawdown(drawdownSecurityID);
  const drawdownDetails = [];
  const drawdownDataKeys = drawdownData ? Object.keys(drawdownData) : [];

  if (drawdownDataKeys.length !== 0) {
    for (const key of drawdownDataKeys) {
      drawdownDetails.push({
        meta: {
          period: key,
          periodReturn: drawdownData?.[key]?.return.toFixed(2) ?? "0.00",
        },
        drawdown: {
          current: drawdownData?.[key]?.drawdown?.current.toFixed(2) ?? "0.00",
          max: drawdownData?.[key]?.drawdown?.max.toFixed(2) ?? "0.00",
        },
        peak: {
          date: drawdownData?.[key]?.drawdown?.peakDate
            ? new Date(drawdownData?.[key]?.drawdown?.peakDate)
                .toISOString()
                .split("T")[0]
            : "yyyy-mm-dd",
        },
        trough: {
          date: drawdownData?.[key]?.drawdown?.troughDate
            ? new Date(drawdownData?.[key]?.drawdown?.troughDate)
                .toISOString()
                .split("T")[0]
            : "yyyy-mm-dd",
        },
        recovery: {
          date: drawdownData?.[key]?.drawdown?.recoveryDate
            ? new Date(drawdownData?.[key]?.drawdown?.recoveryDate)
                .toISOString()
                .split("T")[0]
            : "yyyy-mm-dd",
          days: drawdownData?.[key]?.drawdown?.recoveryDays ?? "0.00",
        },
      });
    }
  }

  return (
    <div id="analysis" className={drawdownAnalysisStyle.container}>
      <h3 className={drawdownAnalysisStyle.title}>Price Analysis</h3>
      <DrawdownAnalysisCard drawdownDetails={drawdownDetails} />
    </div>
  );
};

export default DrawdownAnalysis;
