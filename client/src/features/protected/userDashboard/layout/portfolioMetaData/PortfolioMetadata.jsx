import { useEffect, useState } from "react";

// ! components
import CardType2 from "../../../../../components/layout/public/card/CardType2";

// !LayOuts
import PortfolioSnapshot from "../portfolioSnapshot/PortfolioSnapshot";

// ! styles
import PortfolioMetadataStyle from "./PortfolioMetadata.module.css";

// ! Utils Hooks
import { useWindowWidth } from "../../../../../utils/EventListner/setWindowInnerWidth";

const PortfolioMetadata = ({ content = {} }) => {
  const screenWidth = useWindowWidth();

  return (
    <section className={PortfolioMetadataStyle.metadataContainer}>
      <CardType2 content={content} />
      {screenWidth >= 992 && (
        <PortfolioSnapshot
          CurrentYearPerformenceView={false}
        />
      )}
    </section>
  );
};

export default PortfolioMetadata;
