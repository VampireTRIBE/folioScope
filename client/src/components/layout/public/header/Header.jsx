import React from "react";

import BrandComponet from "../../../UI/others/BrandComponet";

import containerStyle from "../../../../styles/containerStyles/container.module.css";
import ImgButton from "../../../UI/buttons/ImgButton";
import TextButton from "../../../UI/buttons/TextButton";
import ProfileSideBar from "../sideBar/ProfileSideBar";
import MobileViewBar from "../../../../features/public/header/components/mobileViewBar/MobileViewBar";

const Header = ({
  profile: {
    profileBtn = [],
    profileNavbarOptions = [],
    profileSidebarItems = [],
  } = {},
  toggle = null,
}) => {
  const view = true;
  return (
    <header className={`${containerStyle.header} flex`}>
      <BrandComponet />
      <nav className={`${containerStyle.nav} flex`}>
        {profileBtn.map((el, index) => (
          <ImgButton key={el.id || index} {...el} />
        ))}
      </nav>

      {toggle?.profileToggle && (
        <ProfileSideBar profileSidebarItems={profileSidebarItems} />
      )}

      {view && <MobileViewBar />}
    </header>
  );
};

export default Header;
