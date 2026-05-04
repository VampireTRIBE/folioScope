import React from "react";
import CardType1 from "../card/CardType1";

import cardWrapperType1Style from "./cardwrapperType1.module.css";

const CardWrapperType1 = ({ cardData = [], onClick = null }) => {
  return (
    <div className={`${cardWrapperType1Style.cardWrapper}`}>
      {cardData.map((el, index) => (
        <CardType1 key={el.id ?? index} cardDetails={el} onClick={onClick} />
      ))}
    </div>
  );
};

export default CardWrapperType1;
