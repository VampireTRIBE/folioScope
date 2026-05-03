import React from "react";

import homeStyle from "./home.module.css";
import Section1 from "../components/layout/Section1";

const Home = () => {
  return (
    <main className={homeStyle.home}>
      <Section1 />
    </main>
  );
};

export default Home;
