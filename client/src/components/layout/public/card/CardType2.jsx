import React from "react";
import ImgButton from "../../../UI/buttons/ImgButton";
import PriceBadge from "../priceBadge/PriceBadge";

import cardType2Style from "./cardtype2.module.css";
import ImgPlaceholder from "../../../UI/others/imagePlaceholder/ImgPlaceholder";

const CardType2 = ({ content, onClick }) => {
  return (
    <div className={cardType2Style.card}>
      <div className={cardType2Style.cardInfo}>
        <ImgPlaceholder letter={content?.name[0]} />
        <div
          onClick={() => onClick?.(content?.name)}
          className={cardType2Style.infoDetails}>
          <div className={cardType2Style.title}>{content?.name ?? "Name"}</div>
          <div className={cardType2Style.subCategory}>
            {content?.category ?? "Sub Category"}
          </div>
        </div>
      </div>
      <div className={cardType2Style.priceContainer}>
        <PriceBadge
          price={{
            price: content?.price?.currentPrice,
            today: content?.price?.todayChangePercent,
          }}
          currency={true}
        />
      </div>
    </div>
  );
};

export default CardType2;
