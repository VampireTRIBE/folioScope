// ! component
import SignupForm from "../signupForm/SignupForm";

// ! styles
import signupStyle from "./signupstyle.module.css";

const SignUp = () => {
  return (
    <section className={signupStyle.container}>
      <SignupForm />
    </section>
  );
};

export default SignUp;
