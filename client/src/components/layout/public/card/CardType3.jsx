import { formatCamelCase } from "../../../../utils/transformData/textFormat";
import ImgButton from "../../../UI/buttons/ImgButton";
import cardType3Styles from "./cardtype3.module.css";

const CardType3 = ({ title, description }) => {
  const imgAtribute = {
    variantButton: "imgBadgeIcon",
    variantImg: "imgIcon",
    alt: "icon",
  };

  return (
    <div className={cardType3Styles.card}>
      <div className={cardType3Styles.icon}>
        <ImgButton {...imgAtribute} src={`/assets/icons/${title}.png`} />
      </div>
      <div className={cardType3Styles.title}>
        {title ? formatCamelCase(title) : "Title"}
      </div>
      <div className={cardType3Styles.description}>
        {description ?? "Description"}
      </div>
    </div>
  );
};

export default CardType3;
