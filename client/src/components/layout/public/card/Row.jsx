import React from "react";
import ImgButton from "../../../UI/buttons/ImgButton";
import PriceBadge from "../priceBadge/PriceBadge";

const Row = () => {
  return (
    <div>
      <div>
        <ImgButton />
        <div>
          <div>Stock Name</div>
          <div>Industry</div>
        </div>
      </div>
      <div>
        <PriceBadge />
      </div>
    </div>
  );
};

export default Row;
