import React, { useCallback } from "react";

import containerStyle from "../../../../styles/containerStyles/container.module.css";
import TextButton from "../../../UI/buttons/TextButton";

const ProfileSideBar = ({profileSidebarItems = []}) => {
  return (
    <div className={`${containerStyle.userSideBar}`}>
      {profileSidebarItems.map((el, index) => (
        <TextButton key={el.id || index} {...el} />
      ))}
    </div>
  );
};
export default ProfileSideBar;
