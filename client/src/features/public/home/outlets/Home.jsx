import React from "react";

import homeStyle from "./home.module.css";
import MarketGlance from "../components/layout/MarketGlance/MarketGlance";
import TodaysMarkets from "../components/layout/TodaysMarket/TodaysMarkets";

const Home = () => {
  return (
    <main className={homeStyle.home}>
      <MarketGlance />
      <TodaysMarkets />

      <section className={homeStyle.aboutUs}>
        <h3>About US</h3>
      </section>
      <section className={homeStyle.ourServies}>
        <h3>Our Servies</h3>
      </section>
    </main>
  );
};

export default Home;
