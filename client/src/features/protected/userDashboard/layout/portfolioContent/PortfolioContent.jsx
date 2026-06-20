import { useContext } from "react";
import { useParams } from "react-router-dom";

// ! components
import CardType3 from "../../../../../components/layout/public/card/CardType3";
import OverView from "../../../../../components/layout/public/Overview/OverView";

// ! layouts
import DrawdownAnalysis from "../priceAnalysis/DrawdownAnalysis";
import ComparisonAnalysis from "../priceAnalysis/ComparisonAnalysis";
import PortfolioSnapshot from "../portfolioSnapshot/PortfolioSnapshot";
import ButtonContainers from "../portfolioActions/ButtonContainers";

// ! Styles
import portfolioContentStyles from "./portfoliocontent.module.css";

// ! Context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

// ! tanStack Query Hooks
import { useGROUPMETADATA } from "../../hooks/ReactQuery/useQuery";

const PortfolioContent = () => {
  const { gp_id, level } = useParams();
  const { accessToken, userData } = useContext(AuthenticationContext);
  const selectedGroup = userData?.groups?.[`level${level}`]?.[gp_id];
  const groupId = selectedGroup?._id;
  const isLeaf = selectedGroup?.isLeaf === true;
  const { data: GroupMeatadataData } = useGROUPMETADATA(accessToken, groupId);

  const overview = {
    title: GroupMeatadataData?.data?.groupName,
    overview: GroupMeatadataData?.data?.description,
  };

  return (
    <div className={portfolioContentStyles.container}>
      <ButtonContainers isLeaf={isLeaf} />

      <PortfolioSnapshot />

      <OverView {...overview} />

      <DrawdownAnalysis />
      <ComparisonAnalysis />
    </div>
  );
};

export default PortfolioContent;
