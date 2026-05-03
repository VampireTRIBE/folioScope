import React from "react";

import buttonStyle from "../../../styles/singleStyles/button.module.css";

const TextButton = ({ onClick, variant, children, ...rest }) => {
  return (
    <button className={buttonStyle[variant]} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default TextButton;
