import React from "react";

import containerStyle from "../../../styles/containerStyles/container.module.css";
import componentStyle from "../../../styles/componetsStyles/component.module.css";
import buttonStyle from "../../../styles/singleStyles/button.module.css";
import inputStyle from "../../../styles/singleStyles/input.module.css";

const MobileViewNavOptions = () => {
  return (
    <div className={`flex ${containerStyle.mobileViewNavOption}`}>
      <div className={`flex ${componentStyle.searchInput}`}>
        <input
          className={`${inputStyle.searchBar}`}
          type="text"
          id="inputSearch"
          name="inputSearch"
          placeholder="Search for ETFs"></input>
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
      <figure className={`flex ${buttonStyle.imgButton}`}>
        <img
          className={`${buttonStyle.icon}`}
          src="/assets/icons/menu.png"
          alt="user"
          title="user"></img>
      </figure>
    </div>
  );
};

export default MobileViewNavOptions;
