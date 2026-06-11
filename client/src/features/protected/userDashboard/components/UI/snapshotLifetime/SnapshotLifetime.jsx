// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotLifetimeSytles from "./snapshotlifetime.module.css";

const LifetimePerformence = ({ text, price }) => {
  return (
    <div className={snapshotLifetimeSytles.container}>
      <h4 className={snapshotLifetimeSytles.text}>Lifetime PNL</h4>
      <div className={snapshotLifetimeSytles.subContainer}>
        <div>Realized Gains : </div>
        <PriceBadge currency={true} percentage={false} />
      </div>
      <div className={snapshotLifetimeSytles.subContainer}>
        <div>Dividend : </div>
        <PriceBadge currency={true} percentage={false} />
      </div>
    </div>
  );
};

export default LifetimePerformence;
