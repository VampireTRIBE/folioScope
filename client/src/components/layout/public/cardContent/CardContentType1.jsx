import React from "react";

import cardContentType1Style from "./cardContentType1.module.css";
import PriceBadge from "../priceBadge/PriceBadge";

const CardContentType1 = ({
  name = null,
  path = [],
  price = {},
  onClick = null,
}) => {
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
      <h4
        onClick={() => onClick?.(name)}
        className={`${cardContentType1Style.cardName}`}>
        {name}
      </h4>

      <div className={`${cardContentType1Style.cardData} ${graphTrendClass}`}>
        <div className={cardContentType1Style.cardGraph}>
          <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
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
          <PriceBadge price={price} />
        </div>
      </div>
    </div>
  );
};

export default CardContentType1;
