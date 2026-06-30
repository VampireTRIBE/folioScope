import { useParams } from "react-router-dom";

// ! components
import CardType2 from "../../../../../../components/layout/public/card/CardType2";

// ! styles
import securityMetadataStyle from "./securityMetadata.module.css";

// ! tanStack Query Hooks
import { useSecurityOverview } from "../../../hooks/RTK Query/useSecurityQuery";
import { use1DPriceRange } from "../../../../../hooks/RKT Query/usePricesQuery";

const SecurityMetadata = () => {
  const { securityID } = useParams();

  const { data: overviewData } = useSecurityOverview(securityID);

  const { data: price1DData } = use1DPriceRange(securityID);

  const content = {
    name: overviewData ? overviewData?.name : "",
    category: overviewData?.tickerCode,
    price: {
      currentPrice: price1DData?.currentPrice,
      todayChangePercent: price1DData?.todayChange,
    },
  };

  return (
    <section className={securityMetadataStyle.metadataContainer}>
      <CardType2 content={content} />
    </section>
  );
};

export default SecurityMetadata;
