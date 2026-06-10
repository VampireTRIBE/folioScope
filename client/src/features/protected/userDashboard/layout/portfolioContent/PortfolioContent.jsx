import { useParams } from "react-router-dom";

// ! componets
import CardType3 from "../../../../../components/layout/public/card/CardType3";
import OverView from "../../../../../components/layout/public/Overview/OverView";

// ! layouts
import DrawdownAnalysis from "../priceAnalysis/DrawdownAnalysis";
import ComparisionAnalysis from "../priceAnalysis/ComparisionAnalysis";

// ! Styles
import portfolioContentStyles from "./portfoliocontent.module.css";

// ! test
import { useStaticDataSecurityContent } from "../../../../public/securityDashbord/hooks/custom Hooks/useStaticData/useStaticData";
import { useSecurityOverview } from "../../../../public/securityDashbord/hooks/RTK Query/useSecurityQuery";

// ! tanStack Query Hooks
// import { useSecurityOverview } from "../../../hooks/RTK Query/useSecurityQuery";

// ! custom Hooks
// import { useStaticDataSecurityContent } from "../../../hooks/custom Hooks/useStaticData/useStaticData";

const PortfolioContent = () => {
  const { securityID } = useParams();
  const { dummyOverview } = useStaticDataSecurityContent();
  const { data: overviewData } = useSecurityOverview(securityID);

  const classifications = overviewData?.classifications ?? dummyOverview;
  const overview = {
    title: overviewData?.name,
    overview: overviewData?.overview,
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

      <OverView {...overview} />

      <DrawdownAnalysis />
      <ComparisionAnalysis />
    </div>
  );
};

export default PortfolioContent;
