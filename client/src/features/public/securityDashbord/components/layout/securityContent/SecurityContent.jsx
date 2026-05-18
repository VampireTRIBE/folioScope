import Analysis from "../../../../../../components/layout/public/analysis/Analysis";
import CardType3 from "../../../../../../components/layout/public/card/CardType3";
import OverView from "../../../../../../components/layout/public/Overview/OverView";
import securityContentStyles from "./securitycontent.module.css";

const SecurityContent = () => {
  return (
    <div className={securityContentStyles.container}>
      <div className={securityContentStyles.cardContainer}>
        <CardType3 />
        <CardType3 />
        <CardType3 />
        <CardType3 />
        <CardType3 />
      </div>

      <OverView />

      <Analysis />
    </div>
  );
};

export default SecurityContent;
