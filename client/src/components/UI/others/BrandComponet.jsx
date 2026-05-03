import React from "react";

import BrandComponetStyle from "../../../styles/componetsStyles/brandComponent.module.css";
import { useHeaderActions } from "../../../features/public/header/hooks/useHeadersActions";

const BrandComponet = ({ onClick = null }) => {
  if (!onClick) {
    const { goToHome } = useHeaderActions();
    onClick = goToHome;
  }
  return (
    <figure className={`flex ${BrandComponetStyle.brand}`} onClick={onClick}>
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
