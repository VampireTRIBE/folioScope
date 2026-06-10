import imgPlaceholderStyle from "./imgplaceholder.module.css";

const ImgPlaceholder = ({
  containerVarient = null,
  letterVarient = null,
  letter = null,
  onClick = null,
}) => {
  return (
    <div
      className={
        containerVarient
          ? imgPlaceholderStyle[containerVarient]
          : imgPlaceholderStyle.container
      }
      onClick={onClick}>
      <div
        className={
          letterVarient
            ? imgPlaceholderStyle[letterVarient]
            : imgPlaceholderStyle.letter
        }>
        {letter ?? "*"}
      </div>
    </div>
  );
};

export default ImgPlaceholder;
