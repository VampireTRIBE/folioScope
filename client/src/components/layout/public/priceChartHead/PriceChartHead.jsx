import PriceBadge from "../priceBadge/PriceBadge";
import pricechartheadStyle from "./pricecharthead.module.css";

const PriceChartHead = ({ high, low, price }) => {
  return (
    <div className={pricechartheadStyle.container}>
      <div className={pricechartheadStyle.conternerDiv}>
        <div className={pricechartheadStyle.label}>High</div>
        <div className={pricechartheadStyle.value}>{high ?? "0.00"}</div>
      </div>
      <div className={pricechartheadStyle.conternerDiv}>
        <div className={pricechartheadStyle.label}>Low</div>
        <div className={pricechartheadStyle.value}>{low ?? "0.00"}</div>
      </div>
      <div className={pricechartheadStyle.conternerDiv}>
        <div className={pricechartheadStyle.label}>Return</div>
        <PriceBadge price={price} />
      </div>
    </div>
  );
};

export default PriceChartHead;
