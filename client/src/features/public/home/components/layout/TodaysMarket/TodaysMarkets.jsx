import React from "react";
import Head from "../../UI/head/Head";
import TodaysMarketStyle from "./TodaysMarkets.module.css";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";
import Content from "../../UI/content/Content";
import {
  selectActiveFilterByGroup,
  selectActiveSubFilterByGroup,
} from "../../../redux/todaysMarketSelectors";
import { useSelector } from "react-redux";
import { todaysMarketToggleActions } from "../../../redux/todaysMarketsState";

const TodaysMarkets = () => {
  const activeStockCategory = useSelector(selectActiveFilterByGroup("Stocks"));
  const activeEtfCategory = useSelector(selectActiveFilterByGroup("Etfs"));
  const activeMfCategory = useSelector(
    selectActiveFilterByGroup("Mutual Funds"),
  );

  return (
    <section className={TodaysMarketStyle.section2}>
      <div className={TodaysMarketStyle.containerMarketData}>
        <div className={TodaysMarketStyle.cardcontainer}>
          <Head activeCategory={activeStockCategory} />
          <Content activeCategory={activeStockCategory} />
        </div>
        <div className={TodaysMarketStyle.cardcontainer}>
          <Head activeCategory={activeEtfCategory} />
          <Content activeCategory={activeEtfCategory} />
        </div>
        <div className={TodaysMarketStyle.cardcontainer}>
          <Head activeCategory={activeMfCategory} />
          <Content activeCategory={activeMfCategory} />
        </div>
      </div>
      <aside className="container-adds"></aside>
    </section>
  );
};

export default TodaysMarkets;
