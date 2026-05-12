import React from "react";
import CardWrapperType1 from "../../../../../../components/layout/public/cardWrapper/CardWrapperType1.jsx";

import marketGlanceStyle from "./marketGlance.module.css";
import { useSection1Actions } from "../../../hooks/useSection1Actions.js";
import { FETCH_MARKETGLANCE } from "../../../api/fetchApis.js";
import { useQuery } from "@tanstack/react-query";

const MarketGlance = () => {
  const { goToSecurityDashbord } = useSection1Actions();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["MarketGlance"],
    queryFn: FETCH_MARKETGLANCE,
    refetchInterval: 10000,
  });

  if (isPending) {
    return (
      <section className={marketGlanceStyle.section1}>
        <h3 className={marketGlanceStyle.sectionTitle}>Market Glance</h3>

        <div className={marketGlanceStyle.content}>
          <CardWrapperType1 shimmer={true} />
          <CardWrapperType1 shimmer={true} />
          <CardWrapperType1 shimmer={true} />
        </div>
      </section>
    );
  }

  if (isError) {
    return <h1>Error: {error.message}</h1>;
  }

  const safeData = data || {};
  const { data1 = [], data2 = [], data3 = [] } = safeData;

  return (
    <section className={marketGlanceStyle.section1}>
      <h3 className={marketGlanceStyle.sectionTitle}>Market Glance</h3>

      <div className={marketGlanceStyle.content}>
        <CardWrapperType1 cardData={data1} onClick={goToSecurityDashbord} />
        <CardWrapperType1 cardData={data2} onClick={goToSecurityDashbord} />
        <CardWrapperType1 cardData={data3} onClick={goToSecurityDashbord} />
      </div>
    </section>
  );
};

export default MarketGlance;
