import buttonStyle from "./button.module.css";
import ImgButton from "./ImgButton";

const TextImgButton = ({ onClick, name, varient, imgAttibutes }) => {
  return (
    <div onClick={onClick} className={buttonStyle[varient]}>
      <ImgButton {...imgAttibutes} />
      <div className={buttonStyle.text}>{name}</div>
    </div>
  );
};

export default TextImgButton;
