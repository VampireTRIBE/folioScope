// ! components
import CardType2 from "../../../../../components/layout/public/card/CardType2";

// ! styles
import PortfolioMetadataStyle from "./PortfolioMetadata.module.css";

const PortfolioMetadata = ({ content = {} }) => {
  return (
    <section className={PortfolioMetadataStyle.metadataContainer}>
      <CardType2 content={content} />
    </section>
  );
};

export default PortfolioMetadata;
