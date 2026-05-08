import React from "react";
import Head from "../../UI/head/Head";
import section2Style from "./section2.module.css";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";
import Content from "../../UI/content/Content";

const section2 = () => {
  return (
    <section className={section2Style.section2}>
      <div className={section2Style.containerMarketData}>
        <Head />
        <Content/>
      </div>
      <aside className="container-adds"></aside>
    </section>
  );
};

export default section2;
