import React from "react";

import BrandComponetStyle from "../../../styles/componetsStyles/brandComponent.module.css";

const BrandComponet = () => {
  return (
    <figure className={`flex ${BrandComponetStyle.brand}`}>
      <img
        className={`${BrandComponetStyle.brandlogo}`}
        src="/assets/icons/logo.png"
        alt="Logo"
        title="Logo"></img>
      <figcaption className={`${BrandComponetStyle.brandname} flex`}>
        FolioScope
      </figcaption>
    </figure>
  );
};

export default BrandComponet;
