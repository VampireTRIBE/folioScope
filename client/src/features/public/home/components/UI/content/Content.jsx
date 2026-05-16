import React from "react";

import contentSytle from "./content.module.css";
import { useSelector } from "react-redux";
import { selectActiveSubFilterByGroup } from "../../../redux/todaysMarketSelectors";
import { useQuery } from "@tanstack/react-query";
import { FETCH_TODAYS_MARKETS } from "../../../api/fetchApis";
import CardType2 from "../../../../../../components/layout/public/card/CardType2";
import { useTodaysMarketActions } from "../../../hooks/useTodaysMarketActions";

const Content = ({ activeCategory = null }) => {
  const activeContent = useSelector(
    selectActiveSubFilterByGroup(
      activeCategory?.category,
      activeCategory?.subCategory,
    ),
  );

  const { goToSecurityDashbord } = useTodaysMarketActions();

  const { category, subCategory, activeFilter } = activeContent ?? null;

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["TodaysMarkets"],
    queryFn: FETCH_TODAYS_MARKETS,
    refetchInterval: 15000,
  });

  if (isPending) {
    return <div className={contentSytle.contentShimer}></div>;
  }

  const activeContentData =
    data?.[category]?.[subCategory]?.[activeFilter] || [];

  if (activeContentData.length === 0) {
    return <div className={contentSytle.noContent}>No Data Available</div>;
  }

  return (
    <div className={contentSytle.content}>
      {activeContentData.map((content, indx) => (
        <CardType2
          key={content.id ?? indx}
          content={content}
          onClick={goToSecurityDashbord}
        />
      ))}
    </div>
  );
};

export default Content;
