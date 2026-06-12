// ! components
import ImgButton from "../../../UI/buttons/ImgButton";
import PriceBadge from "../priceBadge/PriceBadge";
import ImgPlaceholder from "../../../UI/others/imagePlaceholder/ImgPlaceholder";

// ! styles
import cardType2Style from "./cardtype2.module.css";

const CardType2 = ({ content, onClick }) => {
  return (
    <div className={cardType2Style.card}>
      <div className={cardType2Style.cardInfo}>
        <ImgPlaceholder letter={content?.name ? content?.name[0] : "N"} />
        <div
          onClick={() => onClick?.(content?.name)}
          className={cardType2Style.infoDetails}>
          <div className={cardType2Style.title}>{content?.name ?? "Name"}</div>
          <div className={cardType2Style.subCategory}>
            {content?.category ?? "Category"}
          </div>
        </div>
      </div>
      <div className={cardType2Style.priceContainer}>
        <PriceBadge
          price={{
            price: content?.price?.currentPrice,
            today: content?.price?.todayChangePercent,
          }}
          currency={true}
        />
      </div>
    </div>
  );
};

export default CardType2;
