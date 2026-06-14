// ! components
import Login from "../components/layout/login/Login";

// ! styles
import loginOutletStyle from "./loginoutlet.module.css";

const LoginOutlet = () => {
  return (
    <section className={loginOutletStyle.container}>
      <Login />
    </section>
  );
};

export default LoginOutlet;
