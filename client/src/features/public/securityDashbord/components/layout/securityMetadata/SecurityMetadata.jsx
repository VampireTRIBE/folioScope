import { useParams } from "react-router-dom";
import CardType2 from "../../../../../../components/layout/public/card/CardType2";
import securityMetadataStyle from "./securityMetadata.module.css";
import { useSecurityOverview } from "../../../hooks/RTK Query/useSecurityQuery";
import { use1DPriceRange } from "../../../../../../hooks/usePricesQuery";

const SecurityMetadata = () => {
  const { securityID } = useParams();

  const {
    data: overviewData,
    isPending: overviewPending,
    isError: overviewisError,
    error: overviewError,
  } = useSecurityOverview(securityID);

  const {
    data: price1DData,
    isPending: price1DPending,
    isError: price1DisError,
    error: price1DError,
  } = use1DPriceRange(securityID);

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
