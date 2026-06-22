// ! UI Component
import HoldingCard from "../../components/UI/holdingCard/HoldingCard";

// ! Styles
import HoldingsContainerStyles from "./holdingscontainer.module.css";

const HoldingsContainer = () => {
  const dummyAssets = [
    {
      _id: "1",
      symbol: "GOLDIETF",
      name: "Gold ETF",

      ltp: {
        price: 100.25,
        today: "1.25%",
      },

      oneDayPrice: 250.5,
      oneDayPercentage: "1.25%",

      qty: 100,
      avg: 95.5,

      profitLoss: 475,
      profitLossPercentage: "4.97%",

      invested: 9550,
      current: 10025,
    },
    {
      _id: "2",
      symbol: "NIFTYBEES",
      name: "Nifty Bees",

      ltp: {
        price: 275.8,
        today: "-0.45%",
      },

      oneDayPrice: -120.75,
      oneDayPercentage: "-0.45%",

      qty: 50,
      avg: 260,

      profitLoss: 790,
      profitLossPercentage: "6.08%",

      invested: 13000,
      current: 13790,
    },
    {
      _id: "3",
      symbol: "BANKBEES",
      name: "Bank Bees",

      ltp: {
        price: 510.4,
        today: "0.33%",
      },

      oneDayPrice: 85.2,
      oneDayPercentage: "0.33%",

      qty: 30,
      avg: 525,

      profitLoss: -438,
      profitLossPercentage: "-2.78%",

      invested: 15750,
      current: 15312,
    },
    {
      _id: "4",
      symbol: "ITBEES",
      name: "IT Bees",

      ltp: {
        price: 42.75,
        today: "-1.10%",
      },

      oneDayPrice: -65.4,
      oneDayPercentage: "-1.10%",

      qty: 200,
      avg: 40,

      profitLoss: 550,
      profitLossPercentage: "6.88%",

      invested: 8000,
      current: 8550,
    },
    {
      _id: "5",
      symbol: "MIDCAPETF",
      name: "Midcap ETF",

      ltp: {
        price: 185.6,
        today: "1.72%",
      },

      oneDayPrice: 310.25,
      oneDayPercentage: "1.72%",

      qty: 80,
      avg: 170,

      profitLoss: 1248,
      profitLossPercentage: "9.18%",

      invested: 13600,
      current: 14848,
    },
  ];

  return (
    <div className={HoldingsContainerStyles.container}>
      <h4 className={HoldingsContainerStyles.title}>DETAILED HOLDINGS</h4>
      <div className={HoldingsContainerStyles.content}>
        {dummyAssets.map((asset) => (
          <HoldingCard key={asset._id} holding={asset} />
        ))}
      </div>
    </div>
  );
};

export default HoldingsContainer;
