import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

// ! components
import ImgButton from "../../../../../../components/UI/buttons/ImgButton";

// ! styles
import signupformStyle from "./signupform.module.css";

// ! custom Hooks
import { useStaticData } from "../../../hooks/customHooks/useStaticData/useStaticData";
import { useFormDataActions } from "../../../hooks/customHooks/useFormData";
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions";

// ! selectors
import { selectActiveSingupFormError } from "../../../redux/singupFormSelector";
import Success from "../../../../../../components/layout/public/success/success";

const SignupForm = () => {
  const { imgAttributesBrandLogo } = useStaticData();
  const { status, error, errorMessage, success, successMessage } = useSelector(
    selectActiveSingupFormError,
  );
  const { submitFormSignupData } = useFormDataActions();
  const { goToLogin } = useNavigationActions();

  if (success) {
    return <Success title={"Success"} message={successMessage} />;
  }

  return (
    <form className={signupformStyle.form} onSubmit={submitFormSignupData}>
      <fieldset className={signupformStyle.fieldset} disabled={status}>
        <legend className={signupformStyle.legend}>
          <ImgButton {...imgAttributesBrandLogo} />
          <h3 className={signupformStyle.title}>SIGNUP FORM</h3>
        </legend>

        {error && <div className={signupformStyle.error}>{errorMessage}</div>}

        <div className={signupformStyle.inputGroup}>
          <label htmlFor="firstName" className={signupformStyle.label}>
            First Name :
          </label>

          <input
            className={signupformStyle.input}
            type="text"
            placeholder="First Name"
            id="firstName"
            name="firstName"
          />
        </div>

        <div className={signupformStyle.inputGroup}>
          <label htmlFor="lastName" className={signupformStyle.label}>
            Last Name :
          </label>

          <input
            className={signupformStyle.input}
            type="text"
            placeholder="Last Name"
            id="lastName"
            name="lastName"
          />
        </div>

        <div className={signupformStyle.inputGroup}>
          <label htmlFor="email" className={signupformStyle.label}>
            Email :
          </label>

          <input
            className={signupformStyle.input}
            type="email"
            placeholder="xyz@gmail.com"
            id="email"
            name="email"
          />
        </div>

        <div className={signupformStyle.inputGroup}>
          <label htmlFor="password" className={signupformStyle.label}>
            Password :
          </label>

          <input
            className={signupformStyle.input}
            type="password"
            placeholder="Password"
            id="password"
            name="password"
          />
        </div>

        <div className={signupformStyle.roleContainer}>
          <div className={signupformStyle.roleOption}>
            <input
              className={signupformStyle.radioInput}
              type="radio"
              id="client"
              name="role"
              value="client"
              defaultChecked
              hidden
            />

            <label htmlFor="client" className={signupformStyle.roleLabel}>
              Client
            </label>
          </div>

          <div className={signupformStyle.roleOption}>
            <input
              className={signupformStyle.radioInput}
              type="radio"
              id="admin"
              name="role"
              value="admin"
              hidden
            />

            <label htmlFor="admin" className={signupformStyle.roleLabel}>
              Admin
            </label>
          </div>
        </div>

        <div className={signupformStyle.buttonContainer}>
          <button className={signupformStyle.resetButton} type="reset">
            Reset
          </button>

          <button className={signupformStyle.submitButton} type="submit">
            {status ? "Loading...." : "SignUp"}
          </button>
        </div>

        <div className={signupformStyle.formFooter}>
          <p>Already have acount?</p>
          <p
            className={signupformStyle.loginBtn}
            onClick={status ? null : goToLogin}>
            Login
          </p>
        </div>
      </fieldset>
    </form>
  );
};

export default SignupForm;
