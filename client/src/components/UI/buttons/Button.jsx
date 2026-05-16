import buttonStyle from "../../../styles/singleStyles/button.module.css";

const Button = ({ onClick, text, varient }) => {
  return (
    <button className={buttonStyle[varient] ?? ""} onClick={onClick}>
      {text ?? "Button"}
    </button>
  );
};

export default Button;
