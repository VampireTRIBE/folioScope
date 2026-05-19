import buttonStyle from "../../../styles/singleStyles/button.module.css";

const ImgButton = ({
  onClick,
  variantButton,
  variantImg,
  src,
  alt,
  title,
  ...rest
}) => {
  return (
    <figure onClick={onClick} className={buttonStyle[variantButton]}>
      <img
        className={buttonStyle[variantImg]}
        src={src}
        alt={alt}
        title={title}
        loading="lazy"
        {...rest}></img>
    </figure>
  );
};

export default ImgButton;
