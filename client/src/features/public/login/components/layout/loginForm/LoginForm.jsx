// ! componets
import ImgButton from "../../../../../../components/UI/buttons/ImgButton";

// ! styles
import loginFormStyle from "./loginform.module.css";

// ! custom hooks
import { useStaticData } from "../../../hooks/customHooks/useStaticData/useStaticData";
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions";

// ! tanStack Query hooks
import { useLoginFormMutation } from "../../../hooks/RTK Query/useformMutation";
import { useFormDataActions } from "../../../hooks/customHooks/useFormData";
import { useEffect } from "react";

const LoginForm = () => {
  const { imgAttributesBrandLogo } = useStaticData();
  const {
    goToSignup,
    goToForgotPassword,
    goToSendVerificationMail,
    goToUserDashBord,
  } = useNavigationActions();
  const {
    mutateAsync: loginformMutationFn,
    isPending: isPendingLoginForm,
    isSuccess: isSuccessLoginForm,
    error: errorLoginForm,
    data: respLoginForm,
  } = useLoginFormMutation();
  const { submitFormLoginData, submittedData } = useFormDataActions();

  useEffect(() => {
    if (errorLoginForm?.response?.data?.message === "VERIFYEMAIL") {
      const timer = setTimeout(() => {
        goToSendVerificationMail(submittedData.current);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [errorLoginForm, goToSendVerificationMail]);

  useEffect(() => {
    if (isSuccessLoginForm) {
      const timer = setTimeout(() => {
        goToUserDashBord();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccessLoginForm, goToUserDashBord]);

  return (
    <form
      className={loginFormStyle.form}
      onSubmit={(e) => submitFormLoginData(e, loginformMutationFn)}>
      <fieldset
        className={loginFormStyle.fieldset}
        disabled={isPendingLoginForm}>
        <legend className={loginFormStyle.legend}>
          <ImgButton {...imgAttributesBrandLogo} />
          <h3>Login to folioScope</h3>
        </legend>

        {errorLoginForm && (
          <div className={loginFormStyle.error}>
            {errorLoginForm?.response?.data?.message || "Login Failed"}
          </div>
        )}

        <div className={loginFormStyle.inputGroup}>
          <label htmlFor="email" className={loginFormStyle.label}>
            Email :
          </label>

          <input
            className={loginFormStyle.input}
            type="email"
            placeholder="xyz@gmail.com"
            id="email"
            name="email"
          />
        </div>

        <div className={loginFormStyle.inputGroup}>
          <label htmlFor="password" className={loginFormStyle.label}>
            Password :
          </label>

          <input
            className={loginFormStyle.input}
            type="password"
            placeholder="Password"
            id="password"
            name="password"
          />
        </div>

        <div className={loginFormStyle.forgotPassword}>
          <button
            className={loginFormStyle.forgotPasswordBtn}
            type="button"
            onClick={goToForgotPassword}>
            forgot Password
          </button>
        </div>

        <div className={loginFormStyle.roleContainer}>
          <div className={loginFormStyle.roleOption}>
            <input
              className={loginFormStyle.radioInput}
              type="radio"
              id="client"
              name="role"
              value="client"
              defaultChecked
              hidden
            />

            <label htmlFor="client" className={loginFormStyle.roleLabel}>
              Client
            </label>
          </div>

          <div className={loginFormStyle.roleOption}>
            <input
              className={loginFormStyle.radioInput}
              type="radio"
              id="admin"
              name="role"
              value="admin"
              hidden
            />

            <label htmlFor="admin" className={loginFormStyle.roleLabel}>
              Admin
            </label>
          </div>
        </div>

        <div className={loginFormStyle.buttonContainer}>
          <button className={loginFormStyle.resetButton} type="reset">
            Reset
          </button>

          <button className={loginFormStyle.submitButton} type="submit">
            {isPendingLoginForm ? "Submiting...." : "Login"}
          </button>
        </div>

        <div className={loginFormStyle.formFooter}>
          <p>Dont have Account?</p>
          <p
            className={loginFormStyle.signupBtn}
            onClick={isPendingLoginForm ? null : goToSignup}>
            SignUp
          </p>
        </div>
      </fieldset>
    </form>
  );
};

export default LoginForm;
