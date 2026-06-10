import { useParams } from "react-router-dom";

// ! components
import CardType2 from "../../../../../components/layout/public/card/CardType2";

// ! styles
import PortfolioMetadataStyle from "./PortfolioMetadata.module.css";

// ! tanStack Query Hooks
// import { useSecurityOverview } from "../../../hooks/RTK Query/useSecurityQuery";
// import { use1DPriceRange } from "../../../../../hooks/RKT Query/usePricesQuery";

const PortfolioMetadata = () => {
  const { securityID } = useParams();

  // const {
  //   data: overviewData,
  //   isPending: overviewPending,
  //   isError: overviewisError,
  //   error: overviewError,
  // } = useSecurityOverview(securityID);

  // const {
  //   data: price1DData,
  //   isPending: price1DPending,
  //   isError: price1DisError,
  //   error: price1DError,
  // } = use1DPriceRange(securityID);

  const content = {
    name: "Name",
    category: "Level 1",
    price: {
      currentPrice: 10000,
      todayChangePercent: "0.00",
    },
  };

  return (
    <section className={PortfolioMetadataStyle.metadataContainer}>
      <CardType2 content={content} />
    </section>
  );
};

export default PortfolioMetadata;
