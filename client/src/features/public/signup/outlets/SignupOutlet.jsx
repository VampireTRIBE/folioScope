import SignUp from "../components/layout/signup/SignUp";
import SignupOutletStyle from "./signupoutletstyle.module.css";

const SignupOutlet = () => {
  return (
    <main className={SignupOutletStyle.container}>
      <SignUp />
    </main>
  );
};

export default SignupOutlet;
