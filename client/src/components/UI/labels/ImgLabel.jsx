import React from "react";
import ImgButton from "../buttons/ImgButton";

const ImgLabel = ({ htmlFor, varient, children }) => {
  return (
    <label htmlFor="inputSearch" className={varient}>
      <img
        className={buttonStyle[children.iconInharit]}
        src={children.src}
        alt={children.alt}
        title={children.title}></img>
    </label>
  );
};

export default ImgLabel;
