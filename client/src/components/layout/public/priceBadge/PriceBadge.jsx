import React from "react";
import ImgButton from "../../../UI/buttons/ImgButton";

import pricebadgeStyle from "./pricebadge.module.css";
import cardContentType1Style from "../cardContent/cardcontentType1.module.css";

const PriceBadge = ({
  price,
  currency = false,
  percentage = true,
  priceValue = true,
}) => {
  const today = price?.today?.toString() ?? "";
  const isNegative = today?.startsWith("-");
  let displayValue = isNegative ? today.slice(1) : today;
  if (displayValue[displayValue.length - 1] !== "%") {
    if (displayValue.length === 0) {
      displayValue += "0.00";
    }
    displayValue += "%";
  }

  const imgAtributes = {
    variantButton: "imgBadge",
    variantImg: "priceIcon",
    src: isNegative
      ? "/assets/icons/arrowdown.png"
      : "/assets/icons/arrowup.png",
    alt: "Price Indicater",
  };

  return (
    <>
      {priceValue && (
        <div className={`${pricebadgeStyle.price}`}>
          {currency ? `₹${price?.price ?? "0.00"}` : price?.price}
        </div>
      )}
      {percentage && (
        <div className={pricebadgeStyle.today}>
          <ImgButton {...imgAtributes} />

          <div
            className={isNegative ? pricebadgeStyle.down : pricebadgeStyle.up}>
            {displayValue}
          </div>
        </div>
      )}
    </>
  );
};

export default PriceBadge;
