import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";

// ! Selectors
import { selectActiveSubFilterByGroup } from "../../../redux/todaysMarketSelectors";

// ! APIs
import { FETCH_TODAYS_MARKETS } from "../../../api/FETCH_APIs";

// ! custom Hooks
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions";

// ! styles
import contentStyle from "./content.module.css";

// ! components
import CardType2 from "../../../../../../components/layout/public/card/CardType2";


const Content = ({ activeCategory = null }) => {
  const activeContent = useSelector(
    selectActiveSubFilterByGroup(
      activeCategory?.category,
      activeCategory?.subCategory,
    ),
  );

  const { goToSecurityDashboard } = useNavigationActions();

  const { category, subCategory, activeFilter } = activeContent ?? null;
  const { data, isPending } = useQuery({
    queryKey: ["TodaysMarkets"],
    queryFn: FETCH_TODAYS_MARKETS,
    refetchInterval: 15000,
  });

  if (isPending) {
    return <div className={contentStyle.contentShimmer}></div>;
  }

  const activeContentData =
    data?.[category]?.[subCategory]?.[activeFilter] || [];

  if (activeContentData.length === 0) {
    return <div className={contentStyle.noContent}>No Data Available</div>;
  }

  return (
    <div className={contentStyle.content}>
      {activeContentData.map((content, indx) => (
        <CardType2
          key={content.id ?? indx}
          content={content}
          onClick={goToSecurityDashboard}
        />
      ))}
    </div>
  );
};

export default Content;
