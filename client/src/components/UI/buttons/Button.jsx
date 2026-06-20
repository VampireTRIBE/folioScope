import buttonStyle from "./button.module.css";

const Button = ({ onClick, text, varient, ...rest }) => {
  return (
    <button className={buttonStyle[varient] ?? ""} onClick={onClick} {...rest}>
      {text ?? "Button"}
    </button>
  );
};

export default Button;
