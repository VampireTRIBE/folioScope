import React from "react";

import containerStyle from "../../../styles/containerStyles/container.module.css";
import BrandComponet from "../subComponents/BrandComponet";
import ImgButton from "../../buttonComponents/ImgButton";
import MobileViewNavOptions from "../subComponents/MobileViewNavOptions";
import { useSelector } from "react-redux";
import UserSideBar from "../subComponents/UserSideBar";

const Header = () => {
  const { userToggle, optionsToggle } = useSelector(
    (state) => state.headerToggle,
  );

  console.log(userToggle, optionsToggle);
  return (
    <header className={`${containerStyle.header} flex`}>
      <BrandComponet />
      <nav className={`${containerStyle.nav} flex`}>
        <ImgButton />
      </nav>
      {userToggle && <UserSideBar />}
      
      <MobileViewNavOptions />
    </header>
  );
};

export default Header;
