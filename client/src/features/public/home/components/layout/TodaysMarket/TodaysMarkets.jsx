import { useContext } from "react";
import { useSelector } from "react-redux";

// ! components
import Head from "../../UI/head/Head";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";
import Content from "../../UI/content/Content";

// ! ads components
import PortfolioAdd from "../../../../../../components/layout/public/adds/PortfolioAdd";
import LoginAds from "../../../../../../components/layout/public/adds/LoginAds";
import SignupAds from "../../../../../../components/layout/public/adds/SignUpAds";
import ImgSliderAds from "../../../../../../components/layout/public/adds/ImgSliderAds";

// ! Styles
import TodaysMarketStyle from "./TodaysMarkets.module.css";

// ! Selectors
import {
  selectActiveFilterByGroup,
  selectActiveSubFilterByGroup,
} from "../../../redux/todaysMarketSelectors";
import { todaysMarketToggleActions } from "../../../redux/todaysMarketsState";

// ! Context
import { AuthenticationContext } from "../../../../../../context/authenticationContext";

const TodaysMarkets = () => {
  const { user } = useContext(AuthenticationContext);

  const activeStockCategory = useSelector(selectActiveFilterByGroup("Stocks"));
  const activeEtfCategory = useSelector(selectActiveFilterByGroup("Etfs"));
  const activeMfCategory = useSelector(
    selectActiveFilterByGroup("Mutual Funds"),
  );

  return (
    <section className={TodaysMarketStyle.section2}>
      <div className={TodaysMarketStyle.containerMarketData}>
        {!user && <PortfolioAdd />}
        <div className={TodaysMarketStyle.cardcontainer}>
          <Head activeCategory={activeStockCategory} />
          <Content activeCategory={activeStockCategory} />
        </div>
        <div className={TodaysMarketStyle.cardcontainer}>
          <Head activeCategory={activeEtfCategory} />
          <Content activeCategory={activeEtfCategory} />
        </div>
        <div className={TodaysMarketStyle.cardcontainer}>
          <Head activeCategory={activeMfCategory} />
          <Content activeCategory={activeMfCategory} />
        </div>
      </div>
      {!user && (
        <aside className={TodaysMarketStyle.adsContainer}>
          <h3>Connect with us</h3>
          <LoginAds />
          <ImgSliderAds />
          <SignupAds />
        </aside>
      )}
    </section>
  );
};

export default TodaysMarkets;
