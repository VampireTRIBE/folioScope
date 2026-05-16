import PriceBadge from "../priceBadge/PriceBadge";
import pricechartheadStyle from "./pricecharthead.module.css";

const PriceChartHead = ({ high, low, today }) => {
  return (
    <div className={pricechartheadStyle.container}>
      <div className={pricechartheadStyle.conternerDiv}>
        <div className={pricechartheadStyle.label}>High</div>
        <div className={pricechartheadStyle.value}>₹1000</div>
      </div>
      <div className={pricechartheadStyle.conternerDiv}>
        <div className={pricechartheadStyle.label}>Low</div>
        <div className={pricechartheadStyle.value}>₹8000</div>
      </div>
      <div className={pricechartheadStyle.conternerDiv}>
        <div className={pricechartheadStyle.label}>Return</div>
        <PriceBadge />
      </div>
    </div>
  );
};

export default PriceChartHead;
