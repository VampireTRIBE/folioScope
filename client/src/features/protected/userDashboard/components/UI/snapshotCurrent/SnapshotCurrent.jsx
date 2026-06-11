// ! UI Components
import { useState } from "react";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotCurrentSytles from "./snapshotcurrent.module.css";

const CurrentStatus = ({ text, price }) => {
  const [xirr, setXirr] = useState(false);

  return (
    <div className={snapshotCurrentSytles.container}>
      <div className={snapshotCurrentSytles.subContainer}>
        <div>Investment Value : </div>
        <PriceBadge currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentSytles.subContainer}>
        <div>Current Value : </div>
        <PriceBadge currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentSytles.subContainerPnl}>
        <div>P/L : </div>
        <div>
          <PriceBadge currency={true} />
        </div>
      </div>
      <div className={snapshotCurrentSytles.subContainerPnl}>
        <div>XIRR : </div>
        {xirr ? (
          <div>
            <PriceBadge currency={true} priceValue={false} />
          </div>
        ) : (
          <button className={snapshotCurrentSytles.xirrButton} onClick={() => setXirr(true)}>View</button>
        )}
      </div>
    </div>
  );
};

export default CurrentStatus;
