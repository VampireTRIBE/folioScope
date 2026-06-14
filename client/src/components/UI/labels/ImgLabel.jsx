
import buttonStyle from "../buttons/button.module.css";

const ImgLabel = ({ htmlFor, varient, variant, children }) => {
  return (
    <label htmlFor={htmlFor} className={varient || variant}>
      <img
        className={buttonStyle[children.iconInharit]}
        src={children.src}
        alt={children.alt}
        title={children.title}></img>
    </label>
  );
};

export default ImgLabel;
