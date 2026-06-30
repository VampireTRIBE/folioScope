import { useContext } from "react";
import { useSelector } from "react-redux";

// ! components
import Head from "../../UI/head/Head";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";
import Content from "../../UI/content/Content";
import PortfolioSnapshot from "../../../../../protected/userDashboard/layout/portfolioSnapshot/PortfolioSnapshot";

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
  const { accessToken } = useContext(AuthenticationContext);

  const activeStockCategory = useSelector(selectActiveFilterByGroup("Stocks"));
  const activeEtfCategory = useSelector(selectActiveFilterByGroup("Etfs"));
  const activeMfCategory = useSelector(
    selectActiveFilterByGroup("Mutual Funds"),
  );

  return (
    <section className={TodaysMarketStyle.section2}>
      <div className={TodaysMarketStyle.containerMarketData}>
        {!accessToken && <PortfolioAdd />}
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

      <aside className={TodaysMarketStyle.adsContainer}>
        {!accessToken && (
          <>
            <h3>Connect with us</h3>
            <div className={TodaysMarketStyle.adsContent}>
              <LoginAds />
              <ImgSliderAds />
              <SignupAds />
            </div>
          </>
        )}

        {accessToken && (
          <div className={TodaysMarketStyle.adsContent}>
            <PortfolioSnapshot netPortfolio={true} />
          </div>
        )}
      </aside>
    </section>
  );
};

export default TodaysMarkets;
