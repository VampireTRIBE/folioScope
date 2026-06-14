// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotCurrentyearStyles from "./snapshotcurrentyear.module.css";

const CurrentYearPerformence = ({ currentyear = null }) => {
  const realizedgains = {
    price: currentyear?.realizedgain || 0.0,
  };
  const unrealizedgain = {
    price: currentyear?.unrealizedgain || 0.0,
  };

  const dividend = {
    price: currentyear?.dividend || 0.0,
  };
  const totalgain = {
    price: currentyear?.totalgain || 0.0,
  };
  return (
    <div className={snapshotCurrentyearStyles.container}>
      <h4 className={snapshotCurrentyearStyles.text}>Current Year PNL</h4>
      <div className={snapshotCurrentyearStyles.subContainer}>
        <div>Realized Gains : </div>
        <PriceBadge price={realizedgains} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearStyles.subContainerPnl}>
        <div>Unrealized Gain : </div>
        <PriceBadge price={unrealizedgain} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearStyles.subContainer}>
        <div>Dividend : </div>
        <PriceBadge price={dividend} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearStyles.subContainerPnl}>
        <div>Total Gain : </div>
        <PriceBadge price={totalgain} currency={true} percentage={false} />
      </div>
    </div>
  );
};

export default CurrentYearPerformence;
