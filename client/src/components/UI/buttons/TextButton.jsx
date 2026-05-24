import buttonStyle from "./button.module.css";

const TextButton = ({ onClick, variant, children, ...rest }) => {
  return (
    <button className={buttonStyle[variant]} onClick={onClick} {...rest}>
      {children}
    </button>
  );
};

export default TextButton;
