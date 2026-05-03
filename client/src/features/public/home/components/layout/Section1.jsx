import React, { useEffect } from "react";
import CardWrapperType1 from "../../../../../components/layout/public/cardWrapper/CardWrapperType1.jsx";

import section1Style from "./section1.module.css";
import { useSelector } from "react-redux";
import { get_Section1_Data } from "../../homeSelectors.js";
import {
  START_SECTION_1_AUTO_REFRESH,
  STOP_SECTION_1_AUTO_REFRESH,
} from "../../cor jobs/section1Data.js";

const Section1 = () => {
  const { data1, data2, data3 } = useSelector(get_Section1_Data());

  useEffect(() => {
    START_SECTION_1_AUTO_REFRESH();

    return () => {
      STOP_SECTION_1_AUTO_REFRESH();
    };
  }, []);

  return (
    <section className={`${section1Style.section1}`}>
      <h3 className={`${section1Style.sectionTitle}`}>Market Glance</h3>
      <div className={`${section1Style.content}`}>
        <CardWrapperType1 cardData={data1} />
        <CardWrapperType1 cardData={data2} />
        <CardWrapperType1 cardData={data3} />
      </div>
    </section>
  );
};

export default Section1;
