import { useContext } from "react";
import { useParams } from "react-router-dom";

// ! components
import CardType3 from "../../../../../components/layout/public/card/CardType3";
import OverView from "../../../../../components/layout/public/Overview/OverView";

// ! layouts
import DrawdownAnalysis from "../priceAnalysis/DrawdownAnalysis";
import ComparisonAnalysis from "../priceAnalysis/ComparisonAnalysis";
import PortfolioSnapshot from "../portfolioSnapshot/PortfolioSnapshot";

// ! Styles
import portfolioContentStyles from "./portfoliocontent.module.css";

// ! Context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

// ! tanStack Query Hooks
import { useGROUPMETADATA } from "../../hooks/ReactQuery/useQuery";

// ! custom Hooks
import { useStaticDataSecurityContent } from "../../../../public/securityDashboard/hooks/custom Hooks/useStaticData/useStaticData";

const PortfolioContent = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const groupId = `${userData?.groups?.[`level${level}`]?.[gp_id]?._id}`;
  const { data: GroupMeatadataData } = useGROUPMETADATA(accessToken, groupId);
  const { dummyOverview } = useStaticDataSecurityContent();

  const classifications = dummyOverview;

  const overview = {
    title: GroupMeatadataData?.data?.groupName,
    overview: GroupMeatadataData?.data?.description,
  };

  return (
    <div className={portfolioContentStyles.container}>
      <div className={portfolioContentStyles.cardContainer}>
        {classifications
          .filter((el) => {
            const [k] = Object.keys(el);
            return !!el?.[k];
          })
          .map((el, indx) => {
            const [k] = Object.keys(el);
            return (
              <CardType3
                key={el?.[k]?.id ?? indx}
                title={k}
                description={el?.[k]?.name}
              />
            );
          })}
      </div>

      <PortfolioSnapshot />

      <OverView {...overview} />

      <DrawdownAnalysis />
      <ComparisonAnalysis />
    </div>
  );
};

export default PortfolioContent;
