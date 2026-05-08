import React from "react";

import homeStyle from "./home.module.css";
import Section1 from "../components/layout/section1/Section1";
import Section2 from "../components/layout/section2/Section2";

const Home = () => {
  return (
    <main className={homeStyle.home}>
      <Section1 />
      <Section2 />
    </main>
  );
};

export default Home;
