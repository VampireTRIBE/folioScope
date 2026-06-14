import { useQuery } from "@tanstack/react-query";

// ! styles
import marketGlanceStyle from "./marketGlance.module.css";

// ! components
import CardWrapperType1 from "../../../../../../components/layout/public/cardWrapper/CardWrapperType1.jsx";

// ! Custom hooks
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions.js";

// ! apis
import { FETCH_MARKETGLANCE } from "../../../api/FETCH_APIs.js";

const MarketGlance = () => {
  const { goToSecurityDashboard } = useNavigationActions();

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["MarketGlance"],
    queryFn: FETCH_MARKETGLANCE,
    refetchInterval: 10000,
  });

  if (isPending) {
    return (
      <section className={marketGlanceStyle.container}>
        <h3 className={marketGlanceStyle.Title}>Market Glance</h3>
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
        <CardWrapperType1 cardData={data1} onClick={goToSecurityDashboard} />
        <CardWrapperType1 cardData={data2} onClick={goToSecurityDashboard} />
        <CardWrapperType1 cardData={data3} onClick={goToSecurityDashboard} />
      </div>
    </section>
  );
};

export default MarketGlance;
