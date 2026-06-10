import buttonStyle from "./button.module.css";

import ImgPlaceholder from "../others/imagePlaceholder/ImgPlaceholder";

const ImgButton = ({
  onClick,
  variantButton,
  variantImg,
  src,
  alt,
  title,
  imgplaceHolder = false,
  letter,
  ...rest
}) => {
  return imgplaceHolder ? (
    <ImgPlaceholder
      onClick={onClick}
      containerVarient={variantButton}
      letterVarient={variantImg}
      letter={letter}
    />
  ) : (
    <figure onClick={onClick} className={buttonStyle[variantButton]}>
      <img
        className={buttonStyle[variantImg]}
        src={src}
        alt={alt}
        title={title}
        loading="lazy"
        {...rest}
      />
    </figure>
  );
};

export default ImgButton;
