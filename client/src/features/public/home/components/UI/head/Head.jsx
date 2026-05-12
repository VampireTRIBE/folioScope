import React from "react";
import headStyle from "./head.module.css";
import TextButton from "../../../../../../components/UI/buttons/TextButton";
import ImgButton from "../../../../../../components/UI/buttons/ImgButton";
import TextImgButton from "../../../../../../components/UI/buttons/TextImgButton";
import { selectActiveFilterByKey } from "../../../redux/todaysMarketSelectors";
import { useTodaysMarketActions } from "../../../hooks/useTodaysMarketActions";

const Head = ({ activeCategory = null }) => {
  const { toggleFilter } = useTodaysMarketActions();

  const filterButton = {
    varient: "filterButton",
    name: activeCategory.active ?? "Filter",
    imgAttibutes: {
      variantButton: "icon",
      variantImg: "icon",
      src: "assets/icons/filter.png",
      alt: "filterIcon",
    },
  };

  const headButtonsArray = [
    {
      varient: "headButtonActive",
      name: "Gainers",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/gainer.png",
        alt: "gainer Icon",
      },
    },
    {
      varient: "headButton",
      name: "Lossers",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/losser.png",
        alt: "lossers Icon",
      },
    },
    {
      varient: "headButton",
      name: "52W High",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/52Whigh.png",
        alt: "lossers Icon",
      },
    },
    {
      varient: "headButtonActive",
      name: "52W Low",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/52Wlow.png",
        alt: "lossers Icon",
      },
    },
  ];

  return (
    <div className={headStyle.head}>
      <div className={headStyle.headMetadata}>
        <h3 className={headStyle.title}>
          Today's {activeCategory.category ?? Name}
        </h3>
        <div
          onClick={() => toggleFilter(activeCategory.category)}
          className={headStyle.filterButton}>
          <TextImgButton {...filterButton} />
        </div>
      </div>
      <div className={headStyle.headbuttons}>
        {headButtonsArray.map((button) => (
          <TextImgButton key={button.name} {...button} />
        ))}
      </div>
    </div>
  );
};

export default Head;
