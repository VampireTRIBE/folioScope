import { useParams } from "react-router-dom";
import { useContext } from "react";

// ! styles
import comparisonAnalysisStyle from "./comparisonAnalysis.module.css";

// ! UI Components
import XirrComparisionAnalysisCard from "../../../../../components/layout/public/analysis/comparisonAnalysis/xirrComparision/XirrComparisionAnalysisCard";
import NavComparisionAnalysisCard from "../../../../../components/layout/public/analysis/comparisonAnalysis/navComparisonAnalysis/NavComparisionAnalysisCard";

// ! custom Hooks
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";

// ! tanStack Query Hook
import { useXirrComparision } from "../../hooks/ReactQuery/useQuery";

// ! context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

// ! Session Storage Utils
import { usePublicSecurities } from "../../../../../hooks/RTK Query Hooks/sessionStorage";

const ComparisonAnalysis = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const groupId = `${userData?.groups?.[`level${level}`]?.[gp_id]?._id}`;

  const { data: { INDEX = {} } = {} } = usePublicSecurities();
  const indexName = "NIFTY 50";
  const indexId = INDEX[indexName];
  const {
    data: xirrComparisionData,
    isPending: isPendingxirrComparision,
    isError: isErrorxirrComparision,
    error: errorxirrComparision,
  } = useXirrComparision(groupId, indexId, accessToken);

  const safeXirrComparisionData = {
    indexName: indexName || "N/A",
    xirrAnalysis: {
      groupXirr: xirrComparisionData?.data?.xirrAnalysis?.groupXirr || null,
      indexXirr: xirrComparisionData?.data?.xirrAnalysis?.indexXirr || null,
      alpha: xirrComparisionData?.data?.xirrAnalysis?.alpha || null,
    },
  };

  return (
    <div id="comparison" className={comparisonAnalysisStyle.container}>
      <h3 className={comparisonAnalysisStyle.title}>Comparison Analysis</h3>
      <XirrComparisionAnalysisCard
        xirrComparisionStats={safeXirrComparisionData}
      />
      <NavComparisionAnalysisCard />
    </div>
  );
};

export default ComparisonAnalysis;
