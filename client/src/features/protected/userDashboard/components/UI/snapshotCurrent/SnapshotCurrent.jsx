// ! UI Components
import { useState } from "react";
import PriceBadge from "../../../../../../components/layout/public/priceBadge/PriceBadge";

// ! Styles
import snapshotCurrentSytles from "./snapshotcurrent.module.css";

const CurrentStatus = ({ currentStatus = null }) => {
  const [xirr, setXirr] = useState(false);

  const currentValue = {
    price: currentStatus?.currentvalue || 0.0,
  };
  const investmentValue = {
    price: currentStatus?.investmentvalue || 0.0,
  };
  const pl = {
    price: currentStatus?.pl || 0.0,
    today: currentStatus?.["pl%"] === "NaN" ? "0.00" : currentStatus?.["pl%"],
  };

  return (
    <div className={snapshotCurrentSytles.container}>
      <div className={snapshotCurrentSytles.subContainer}>
        <div>Investment Value : </div>
        <PriceBadge
          price={investmentValue}
          currency={true}
          percentage={false}
        />
      </div>
      <div className={snapshotCurrentSytles.subContainer}>
        <div>Current Value : </div>
        <PriceBadge price={currentValue} currency={true} percentage={false} />
      </div>
      <div className={snapshotCurrentSytles.subContainerPnl}>
        <div>Unrealized P/L : </div>
        <div>
          <PriceBadge price={pl} currency={true} />
        </div>
      </div>
      <div className={snapshotCurrentSytles.subContainerPnl}>
        <div>XIRR : </div>
        {xirr ? (
          <div>
            <PriceBadge currency={true} priceValue={false} />
          </div>
        ) : (
          <button
            className={snapshotCurrentSytles.xirrButton}
            onClick={() => setXirr(true)}>
            View
          </button>
        )}
      </div>
    </div>
  );
};

export default CurrentStatus;
