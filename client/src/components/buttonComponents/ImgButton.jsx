import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import buttonStyle from "../../styles/singleStyles/button.module.css";
import { headerToggleActions } from "../../redux/toogleState/headerToggleStates";

const ImgButton = () => {
  const dispatch = useDispatch();

  const toogleState = useCallback(() =>
    dispatch(headerToggleActions.TOGGLE({ key: "userToggle" })),
  );

  return (
    <figure onClick={toogleState} className={`${buttonStyle.imgButton}`}>
      <img
        className={`${buttonStyle.icon}`}
        src="/assets/icons/user.png"
        alt="user"
        title="user"></img>
    </figure>
  );
};

export default ImgButton;
