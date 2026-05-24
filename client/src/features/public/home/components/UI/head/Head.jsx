import { useSelector } from "react-redux";

// ! custom Hooks
import { useTodaysMarketActions } from "../../../hooks/customHooks/useTodaysMarketActions";

// ! selectors
import { selectActiveSubFilterByGroup } from "../../../redux/todaysMarketSelectors";

// ! Styles
import headStyle from "./head.module.css";

// ! Components
import TextImgButton from "../../../../../../components/UI/buttons/TextImgButton";


const Head = ({ activeCategory = null }) => {
  const { activeFilter } = useSelector(
    selectActiveSubFilterByGroup(
      activeCategory?.category,
      activeCategory?.subCategory,
    ),
  );

  const { toggleFilter, toggleSubFilter } = useTodaysMarketActions();

  const filterButton = {
    varient: "filterButton",
    name: activeCategory?.subCategory ?? "Sub Category",
    imgAttibutes: {
      variantButton: "icon",
      variantImg: "icon",
      src: "assets/icons/filter.png",
      alt: "filterIcon",
    },
  };

  const headButtonsArray = [
    {
      id: "gainers",
      varient: activeFilter === "gainers" ? "headButtonActive" : "headButton",
      name: "Gainers",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/gainer.png",
        alt: "gainer Icon",
      },
    },
    {
      id: "losers",
      varient: activeFilter === "losers" ? "headButtonActive" : "headButton",
      name: "Losers",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/losser.png",
        alt: "losers Icon",
      },
    },
    {
      id: "near52WHigh",
      varient:
        activeFilter === "near52WHigh" ? "headButtonActive" : "headButton",
      name: "52W High",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/52Whigh.png",
        alt: "52WHigh Icon",
      },
    },
    {
      id: "near52WLow",
      varient:
        activeFilter === "near52WLow" ? "headButtonActive" : "headButton",
      name: "52W Low",
      imgAttibutes: {
        variantButton: "iconInharit",
        variantImg: "iconInharit",
        src: "assets/icons/52Wlow.png",
        alt: "52WLow Icon",
      },
    },
  ];

  return (
    <div className={headStyle.head}>
      <div className={headStyle.headMetadata}>
        <h3 className={headStyle.title}>
          Today's {activeCategory?.category ?? "Category"}
        </h3>
        <div
          onClick={() => toggleFilter(activeCategory?.category)}
          className={headStyle.filterButton}>
          <TextImgButton {...filterButton} />
        </div>
      </div>
      <div className={headStyle.headbuttons}>
        {headButtonsArray.map((button) => (
          <TextImgButton
            onClick={() =>
              toggleSubFilter(
                activeCategory?.category,
                activeCategory?.subCategory,
                button.id,
              )
            }
            key={button.id}
            {...button}
          />
        ))}
      </div>
    </div>
  );
};

export default Head;
