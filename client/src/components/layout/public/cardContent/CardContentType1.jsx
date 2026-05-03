import React from "react";

import cardContentType1Style from "./cardContentType1.module.css";

const CardContentType1 = ({ name = null, path = [], price = {} }) => {
  const width = 100;
  const height = 40;
 
  const max = Math.max(...path);
  const min = Math.min(...path);

  const points = path
    .map((value, index) => {
      const x = (index / (path.length - 1)) * width;

      const y = height - ((value - min) / (max - min || 1)) * height;

      return `${x},${y}`;
    })
    .join(" ");

  const graphTrendClass =
    path[path.length - 1] - path[0] < 0
      ? cardContentType1Style.down
      : cardContentType1Style.up;

  return (
    <div className={`${cardContentType1Style.card}`}>
      <h4 className={`${cardContentType1Style.cardName}`}>
        {name}
      </h4>

      <div
        className={`${cardContentType1Style.cardData} ${graphTrendClass}`}
      >
        <div className={cardContentType1Style.cardGraph}>
          <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
          >
            <polyline
              points={points}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className={`${cardContentType1Style.cardPrice}`}>
          <div className={`${cardContentType1Style.price}`}>{price.price}</div>

          <div
            className={
              price.today[0] === "-"
                ? cardContentType1Style.down
                : cardContentType1Style.up
            }
          >
            {price.today}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardContentType1;