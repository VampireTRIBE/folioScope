// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotLifetimeStyles from "./snapshotlifetime.module.css";

const LifetimePerformence = ({ lifetime = null }) => {
  const dividend = {
    price: lifetime?.dividend || 0.0,
  };
  const realized = {
    price: lifetime?.realized || 0.0,
  };
  const totalgain = {
    price: lifetime?.totalgain || 0.0,
  };
  return (
    <div className={snapshotLifetimeStyles.container}>
      <h4 className={snapshotLifetimeStyles.text}>Lifetime PNL</h4>
      <div className={snapshotLifetimeStyles.subContainer}>
        <div>Total Gains : </div>
        <PriceBadge price={totalgain} currency={true} percentage={false} />
      </div>
      <div className={snapshotLifetimeStyles.subContainer}>
        <div>Realized Gains : </div>
        <PriceBadge price={realized} currency={true} percentage={false} />
      </div>
      <div className={snapshotLifetimeStyles.subContainer}>
        <div>Dividend : </div>
        <PriceBadge price={dividend} currency={true} percentage={false} />
      </div>
    </div>
  );
};

export default LifetimePerformence;
