// ! UI Component
import HoldingCard from "../../components/UI/holdingCard/HoldingCard";

// ! Styles
import HoldingsContainerStyles from "./holdingscontainer.module.css";

const HoldingsContainer = ({ userHoldings = [] }) => {
  return (
    <div className={HoldingsContainerStyles.container}>
      <h4 className={HoldingsContainerStyles.title}>DETAILED HOLDINGS</h4>
      <div className={HoldingsContainerStyles.content}>
        {userHoldings.length === 0 && (
          <h2 className={HoldingsContainerStyles.noHolding}>
            No Holdings In this Bucket
          </h2>
        )}
        {userHoldings.map((asset) => (
          <HoldingCard key={asset._id} holding={asset} />
        ))}
      </div>
    </div>
  );
};

export default HoldingsContainer;
