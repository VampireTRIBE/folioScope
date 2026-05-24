// ! styles
import homeStyle from "./home.module.css";

// ! components
import MarketGlance from "../components/layout/MarketGlance/MarketGlance";
import TodaysMarkets from "../components/layout/TodaysMarket/TodaysMarkets";
import AboutUs from "../components/layout/About Us/AboutUs";
import OurServices from "../components/layout/Our Services/OurServices";

const Home = () => {
  return (
    <main className={homeStyle.home}>
      <MarketGlance />
      <TodaysMarkets />
      <AboutUs />
      <OurServices />
    </main>
  );
};

export default Home;
