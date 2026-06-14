import { useContext } from "react";
import { useParams } from "react-router-dom";

// ! components
import CardType2 from "../../../../../components/layout/public/card/CardType2";

// ! styles
import PortfolioMetadataStyle from "./PortfolioMetadata.module.css";

// ! Context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

// ! tanStack Query Hooks
import { useGROUPMETADATA } from "../../hooks/ReactQuery/useQuery";
// import { use1DPriceRange } from "../../../../hooks/RKT Query/usePricesQuery";

const PortfolioMetadata = ({ content = {} }) => {
  return (
    <section className={PortfolioMetadataStyle.metadataContainer}>
      <CardType2 content={content} />
    </section>
  );
};

export default PortfolioMetadata;
