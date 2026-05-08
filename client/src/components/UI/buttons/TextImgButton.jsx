import React from "react";
import buttonStyle from "../../../styles/singleStyles/button.module.css";
import ImgButton from "./ImgButton";

const TextImgButton = ({ name, varient, imgAttibutes }) => {
  return (
    <div className={buttonStyle[varient]}>
      <ImgButton {...imgAttibutes} />
      <div className={buttonStyle.text}>{name}</div>
    </div>
  );
};

export default TextImgButton;
