import { useParams } from "react-router-dom";
import CardType3 from "../../../../../../components/layout/public/card/CardType3";
import OverView from "../../../../../../components/layout/public/Overview/OverView";
import securityContentStyles from "./securitycontent.module.css";
import { useSecurityOverview } from "../../../hooks/RTK Query/useSecurityQuery";
import DrawdownAnalysis from "../priceAnalysis/DrawdownAnalysis";
import ComparisionAnalysis from "../priceAnalysis/ComparisionAnalysis";

const dummyOverview = [
  {
    assetClass: {
      id: "assetClass",
      name: "Class",
    },
  },
  {
    assetCategory: {
      id: "assetCategory",
      name: "Category",
    },
  },
  {
    assetSubCategory: {
      id: "assetSubCategory",
      name: "Sub Category",
    },
  },
];

const SecurityContent = () => {
  const { securityID } = useParams();
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
      <ComparisionAnalysis />
    </div>
  );
};

export default SecurityContent;
