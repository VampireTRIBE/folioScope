import { useParams } from "react-router-dom";
import drawdownAnalysisStyle from "./drawdownanalysis.module.css";
import { useSecurityDrawdown } from "../../../hooks/RTK Query/useSecurityQuery";
import DrawdownAnalysisCard from "../../../../../../components/layout/public/analysis/DrawdownAnalysisCard";

const DrawdownAnalysis = () => {
  const { securityID } = useParams();
  const { data: drawdownData } = useSecurityDrawdown(securityID);

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
