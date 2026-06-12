// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotCurrentyearSytles from "./snapshotcurrentyear.module.css";

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
    <div className={snapshotCurrentyearSytles.container}>
      <h4 className={snapshotCurrentyearSytles.text}>Current Year PNL</h4>
      <div className={snapshotCurrentyearSytles.subContainer}>
        <div>Realized Gains : </div>
        <PriceBadge price={realizedgains} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearSytles.subContainerPnl}>
        <div>Unrealized Gain : </div>
        <PriceBadge price={unrealizedgain} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearSytles.subContainer}>
        <div>Dividend : </div>
        <PriceBadge price={dividend} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearSytles.subContainerPnl}>
        <div>Total Gain : </div>
        <PriceBadge price={totalgain} currency={true} percentage={false} />
      </div>
    </div>
  );
};

export default CurrentYearPerformence;
