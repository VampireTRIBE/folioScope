import ImgButton from "../../../UI/buttons/ImgButton";
import cardType3Styles from "./cardtype3.module.css";

const CardType3 = ({ imgAtributes, title, discription }) => {
  const imgAtribute = {
    variantButton: "imgBadgeIcon",
    variantImg: "imgIcon",
    src: "/assets/icons/assetClass.png",
    alt: "icon"
  };

  return (
    <div className={cardType3Styles.card}>
      <div className={cardType3Styles.icon}>
        <ImgButton {...imgAtribute} />
      </div>
      <div className={cardType3Styles.title}>{title ?? "Title"}</div>
      <div className={cardType3Styles.discription}>
        {title ?? "Discription"}
      </div>
    </div>
  );
};

export default CardType3;
