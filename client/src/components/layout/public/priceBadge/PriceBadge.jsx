import React from "react";
import ImgButton from "../../../UI/buttons/ImgButton";

import pricebadgeStyle from "./pricebadge.module.css";
import cardContentType1Style from "../cardContent/cardcontentType1.module.css";

const PriceBadge = ({ price, currency = false }) => {
  const today = price?.today.toString() ?? "";
  const isNegative = today.startsWith("-");
  let displayValue = isNegative ? today.slice(1) : today;
  if (displayValue[displayValue.length - 1] !== "%") {
    displayValue += "%";
  }

  const imgAtributes = {
    variantButton: "imgBadge",
    variantImg: "priceIcon",
    src: isNegative ? "assets/icons/arrowdown.png" : "assets/icons/arrowup.png",
    alt: "Price Indicater",
  };

  return (
    <>
      <div className={`${pricebadgeStyle.price}`}>
        {currency ? `₹${price?.price}` : price?.price}
      </div>
      <div className={pricebadgeStyle.today}>
        <ImgButton {...imgAtributes} />

        <div className={isNegative ? pricebadgeStyle.down : pricebadgeStyle.up}>
          {displayValue}
        </div>
      </div>
    </>
  );
};

export default PriceBadge;
