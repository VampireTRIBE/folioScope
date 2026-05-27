// ! componets
import LoginForm from "../loginForm/LoginForm";

// ! styles
import loginStyle from "./login.module.css";

const Login = () => {
  return (
    <section className={loginStyle.section}>
      <LoginForm />
    </section>
  );
};

export default Login;
