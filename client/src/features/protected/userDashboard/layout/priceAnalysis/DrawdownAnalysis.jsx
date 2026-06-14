import { useContext } from "react";
import { useParams } from "react-router-dom";

// ! styles
import drawdownAnalysisStyle from "./drawdownanalysis.module.css";

// ! Components
import DrawdownAnalysisCard from "../../../../../components/layout/public/analysis/DrawdownAnalysisCard";

// ! tanStack Query Hook
import { useGroupDrawdown } from "../../hooks/ReactQuery/useQuery";

// ! context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

const DrawdownAnalysis = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const groupId = `${userData?.groups?.[`level${level}`]?.[gp_id]?._id}`;

  const { data: drawdownData } = useGroupDrawdown(groupId, accessToken);

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
