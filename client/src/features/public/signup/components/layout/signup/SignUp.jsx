// ! component
import SignupForm from "../signupForm/SignupForm";

// ! styles
import singupStyle from "./singupstyle.module.css";

const SignUp = () => {
  return (
    <section className={singupStyle.container}>
      <SignupForm />
    </section>
  );
};

export default SignUp;
