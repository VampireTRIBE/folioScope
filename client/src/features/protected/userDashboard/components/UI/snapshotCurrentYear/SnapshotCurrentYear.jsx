// ! UI Components
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotCurrentyearSytles from "./snapshotcurrentyear.module.css";

const CurrentYearPerformence = ({ text, price }) => {
  return (
    <div className={snapshotCurrentyearSytles.container}>
      <h4 className={snapshotCurrentyearSytles.text}>Current Year PNL</h4>
      <div className={snapshotCurrentyearSytles.subContainer}>
        <div>Realized Gains : </div>
        <PriceBadge currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearSytles.subContainer}>
        <div>Dividend : </div>
        <PriceBadge currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentyearSytles.subContainerPnl}>
        <div>Unrealized Gain : </div>
        <div>
          <PriceBadge currency={true} percentage={false} />
        </div>
      </div>
      <div className={snapshotCurrentyearSytles.subContainerPnl}>
        <div>Total Gain : </div>
        <div>
          <PriceBadge currency={true} percentage={false} />
        </div>
      </div>
    </div>
  );
};

export default CurrentYearPerformence;
