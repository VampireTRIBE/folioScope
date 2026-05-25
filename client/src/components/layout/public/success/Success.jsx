import successStyle from "./success.module.css";

const Success = ({ title, message }) => {
  return (
    <div className={successStyle.container}>
      <h3 className={successStyle.title}>{title} ✅</h3>
      <div className={successStyle.content}>{message}</div>
    </div>
  );
};

export default Success;
