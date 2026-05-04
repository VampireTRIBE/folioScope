import React from "react";
import CardContentType1 from "../cardContent/CardContentType1";

const CardType1 = ({ cardDetails = [], onClick = null }) => {
  return (
    <>
      {cardDetails.map((el, index) => (
        <CardContentType1 key={el.id ?? index} {...el} onClick={onClick} />
      ))}
    </>
  );
};

export default CardType1;
