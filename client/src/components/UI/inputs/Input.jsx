import React from "react";

import inputStyle from "../../../styles/singleStyles/input.module.css";

const Input = ({ type = "text", varient, id, name, placeholder, ...rest }) => {
  return (
    <input
      className={inputStyle[varient]}
      type={type}
      id={id}
      name={name}
      placeholder={placeholder}
      {...rest}></input>
  );
};
export default Input;
