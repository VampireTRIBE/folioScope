import React from "react";

import homeStyle from "./home.module.css";
import MarketGlance from "../components/layout/MarketGlance/MarketGlance";
import TodaysMarkets from "../components/layout/TodaysMarket/TodaysMarkets";

const Home = () => {
  return (
    <main className={homeStyle.home}>
      <MarketGlance />
      <TodaysMarkets />
    </main>
  );
};

export default Home;
