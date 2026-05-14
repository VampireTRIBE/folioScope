import React from "react";
import CardContentType1 from "../cardContent/CardContentType1";

const CardType1 = ({ cardDetails = [], onClick = null, shimmer = false }) => {
  if (shimmer) {
    const cardDataShemmer = new Array(1).fill("");
    return (
      <>
        {cardDataShemmer.map((_, index) => (
          <CardContentType1 key={index} shimmer={shimmer} />
        ))}
      </>
    );
  }
  return (
    <>
      {cardDetails.map((el, index) => (
        <CardContentType1 key={el.id ?? index} {...el} onClick={onClick} />
      ))}
    </>
  );
};

export default CardType1;
