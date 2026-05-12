import React from "react";
import Head from "../../UI/head/Head";
import TodaysMarketStyle from "./TodaysMarkets.module.css";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";
import Content from "../../UI/content/Content";
import { selectActiveFilterByKey } from "../../../redux/todaysMarketSelectors";
import { useSelector } from "react-redux";

const TodaysMarkets = () => {
  const activeStockCategory = useSelector(selectActiveFilterByKey("Stocks"));
  const activeEtfCategory = useSelector(selectActiveFilterByKey("Etfs"));
  const activeMfCategory = useSelector(selectActiveFilterByKey("Mutual Funds"));

  return (
    <section className={TodaysMarketStyle.section2}>
      <div className={TodaysMarketStyle.containerMarketData}>
        <div>
          <Head activeCategory={activeStockCategory} />
          <Content />
        </div>
        <div>
          <Head activeCategory={activeEtfCategory} />
          <Content />
        </div>
        <div>
          <Head activeCategory={activeMfCategory} />
          <Content />
        </div>
      </div>
      <aside className="container-adds"></aside>
    </section>
  );
};

export default TodaysMarkets;
