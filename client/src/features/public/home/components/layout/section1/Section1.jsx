import React, { useEffect } from "react";
import CardWrapperType1 from "../../../../../../components/layout/public/cardWrapper/CardWrapperType1.jsx";

import section1Style from "./section1.module.css";
import { useSelector } from "react-redux";
import { get_Section1_Data } from "../../../homeSelectors.js";
import {
  START_SECTION_1_AUTO_REFRESH,
  STOP_SECTION_1_AUTO_REFRESH,
} from "../../../autoRefreshData/section1Data.js";
import { useSection1Actions } from "../../../hooks/useSection1Actions.js";

const Section1 = () => {
  const { data1, data2, data3 } = useSelector(get_Section1_Data());
  const { goToSecurityDashbord } = useSection1Actions();

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
        <CardWrapperType1 cardData={data1} onClick={goToSecurityDashbord} />
        <CardWrapperType1 cardData={data2} onClick={goToSecurityDashbord} />
        <CardWrapperType1 cardData={data3} onClick={goToSecurityDashbord} />
      </div>
    </section>
  );
};

export default Section1;
