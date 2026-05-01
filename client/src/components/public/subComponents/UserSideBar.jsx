import React, { useCallback } from "react";

import containerStyle from "../../../styles/containerStyles/container.module.css";
import buttonStyle from "../../../styles/singleStyles/button.module.css";
import { headerToggleActions } from "../../../redux/toogleState/headerToggleStates";
import { useDispatch } from "react-redux";

const UserSideBar = () => {
  const dispatch = useDispatch();
  const toogleState = useCallback(() =>
    dispatch(headerToggleActions.TOGGLE({ key: "userToggle" })),
  );
  return (
    <div className={`${containerStyle.userSideBar}`}>
      <button className={`${buttonStyle.sideBarbtn}`} onClick={toogleState}>
        CLOSE
      </button>
      <button className={`${buttonStyle.sideBarbtn}`} onClick={toogleState}>
        LOGIN
      </button>
      <button className={`${buttonStyle.sideBarbtn}`} onClick={toogleState}>
        SIGNUP
      </button>
    </div>
  );
};

export default UserSideBar;
