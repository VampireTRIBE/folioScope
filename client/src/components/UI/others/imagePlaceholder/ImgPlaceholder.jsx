import imgPlaceholderStyle from "./imgplaceholder.module.css";

const ImgPlaceholder = ({ letter = null }) => {
  return (
    <div className={imgPlaceholderStyle.container}>
      <div className={imgPlaceholderStyle.letter}>{letter}</div>
    </div>
  );
};

export default ImgPlaceholder;
