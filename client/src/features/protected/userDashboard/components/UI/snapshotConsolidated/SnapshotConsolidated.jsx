// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotConsolidatedSytles from "./snapshotconsolidated.module.css";

const SnapshotConsolidated = ({ snapshot = null }) => {
  const currentValue = {
    price: snapshot?.netcurrentvalue || 0.0,
  };
  const cash = {
    price: snapshot?.consolidatedcash || 0.0,
  };
  const tax = {
    price: snapshot?.consolidatedtax || 0.0,
  };

  return (
    <div className={snapshotConsolidatedSytles.container}>
      <h4 className={snapshotConsolidatedSytles.text}>Consolidated Snapshot</h4>
      <div className={snapshotConsolidatedSytles.subContainer}>
        <div>Net Current Value : </div>
        <PriceBadge price={currentValue} currency={true} percentage={false} />
      </div>
      <div className={snapshotConsolidatedSytles.subContainer}>
        <div>Consolidated Cash : </div>
        <PriceBadge price={cash} currency={true} percentage={false} />
      </div>
      <div className={snapshotConsolidatedSytles.subContainerPnl}>
        <div>Consolidated Tax : </div>
        <div>
          <PriceBadge price={tax} currency={true} percentage={false} />
        </div>
      </div>
    </div>
  );
};

export default SnapshotConsolidated;
