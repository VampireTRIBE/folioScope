import React from "react";

import containerStyle from "../../../../styles/containerStyles/container.module.css";
import componentStyle from "../../../../styles/componetsStyles/component.module.css";
import buttonStyle from "../../../../styles/singleStyles/button.module.css";
import Input from "../../../UI/inputs/Input";
import ImgLabel from "../../../UI/labels/ImgLabel";
import ImgButton from "../../../UI/buttons/ImgButton";

const MobileViewBar = () => {
  return (
    <div className={`flex ${containerStyle.mobileViewNavOption}`}>
      <div className={`flex ${componentStyle.searchInput}`}>
        <Input
          varient={"searchBar"}
          id={"inputSearch"}
          name={"inputSearch"}
          placeholder={"Search for Insturments"}
        />
        <label
          htmlFor="inputSearch"
          className={`flex ${buttonStyle.imgButtonInharit}`}>
          <img
            className={`${buttonStyle.iconInharit}`}
            src="/assets/icons/search.png"
            alt="search icon"
            title="search icon"></img>
        </label>
      </div>
    </div>
  );
};

export default MobileViewBar;
