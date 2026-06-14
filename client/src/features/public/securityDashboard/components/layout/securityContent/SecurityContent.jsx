import { useParams } from "react-router-dom";

// ! components
import CardType3 from "../../../../../../components/layout/public/card/CardType3";
import OverView from "../../../../../../components/layout/public/Overview/OverView";

// ! Layouts
import DrawdownAnalysis from "../priceAnalysis/DrawdownAnalysis";
import ComparisonAnalysis from "../priceAnalysis/ComparisonAnalysis";

// ! Styles
import securityContentStyles from "./securitycontent.module.css";

// ! tanStack Query Hooks
import { useSecurityOverview } from "../../../hooks/RTK Query/useSecurityQuery";

// ! custom Hooks
import { useStaticDataSecurityContent } from "../../../hooks/custom Hooks/useStaticData/useStaticData";

const SecurityContent = () => {
  const { securityID } = useParams();
  const { dummyOverview } = useStaticDataSecurityContent();
  const { data: overviewData } = useSecurityOverview(securityID);

  const classifications = overviewData?.classifications ?? dummyOverview;
  const overview = {
    title: overviewData?.name,
    overview: overviewData?.overview,
  };

  return (
    <div className={securityContentStyles.container}>
      <div className={securityContentStyles.cardContainer}>
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
      <ComparisonAnalysis />
    </div>
  );
};

export default SecurityContent;
