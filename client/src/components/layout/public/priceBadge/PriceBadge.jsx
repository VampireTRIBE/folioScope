import React from "react";
import ImgButton from "../../../UI/buttons/ImgButton";

import pricebadgeStyle from "./pricebadge.module.css";
import cardContentType1Style from "../cardContent/cardcontentType1.module.css";

const PriceBadge = ({ price }) => {
  const today = price?.today ?? "";

  const isNegative = today.startsWith("-");
  const displayValue = isNegative ? today.slice(1) : today;

  const imgAtributes = {
    variantButton: "imgBadge",
    variantImg: "priceIcon",
    src: isNegative ? "assets/icons/arrowdown.png" : "assets/icons/arrowup.png",
    alt: "Price Indicater",
  };

  return (
    <>
      <div className={`${pricebadgeStyle.price}`}>{price?.price}</div>
      <div className={pricebadgeStyle.today}>
        <ImgButton {...imgAtributes} />

        <div
          className={
            isNegative ? pricebadgeStyle.down : pricebadgeStyle.up
          }>
          {displayValue}
        </div>
      </div>
    </>
  );
};

export default PriceBadge;
