import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ! components
import RequestStatus from "../../../../../components/layout/public/requestStatus/RequestStatus";

// ! Styles
import confirmPasswordOutletStyle from "./confirmpassword.module.css";

// ! custom hooks
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";
import { useFormDataActions } from "../hooks/customHooks/useSubmitForm";

// ! tanStack Query hook
import { useChangePasswordMutation } from "../hooks/RTK Query/useFormMutation";

const ConfirmPasswordOutlet = () => {
  const { goToLogin, goToSendVerificationMail, goToConfirmPassword } =
    useNavigationActions();
  const { intialRender, submitChangePassword } = useFormDataActions();
  const { state } = useLocation();

  const {
    mutateAsync: ChangePasswordMutationFn,
    isPending: isPendingChangePassword,
    isSuccess: isSuccessChangePassword,
    isError: isErrorChangePassword,
    error: errorChangePassword,
    data: respChangePassword,
  } = useChangePasswordMutation();

  useEffect(() => {
    if (errorChangePassword?.response?.data?.message === "VERIFYEMAIL") {
      goToSendVerificationMail();
    }
  }, [errorChangePassword, goToSendVerificationMail]);

  useEffect(() => {
    if (isSuccessChangePassword) {
      const timer = setTimeout(() => {
        goToLogin();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccessChangePassword, goToConfirmPassword]);

  return (
    <main className={confirmPasswordOutletStyle.container}>
      <section className={confirmPasswordOutletStyle.section}>
        {!intialRender && (
          <RequestStatus
            name={"Change Password"}
            isPending={isPendingChangePassword}
            isSuccess={isSuccessChangePassword}
            isError={isErrorChangePassword}
            error={errorChangePassword}
            respData={respChangePassword}
            state={{
              pending: "Changing Password",
              error: "Change Password Failed",
            }}
          />
        )}

        <form
          onSubmit={(e) =>
            submitChangePassword(e, ChangePasswordMutationFn, state?.email)
          }
          className={confirmPasswordOutletStyle.form}>
          <fieldset
            className={confirmPasswordOutletStyle.fieldset}
            disabled={isPendingChangePassword}>
            {intialRender && (
              <legend className={confirmPasswordOutletStyle.legend}>
                Change Password
              </legend>
            )}
            <div className={confirmPasswordOutletStyle.inputGroup}>
              <label
                htmlFor="newPassword"
                className={confirmPasswordOutletStyle.label}>
                New Password :
              </label>

              <input
                className={confirmPasswordOutletStyle.input}
                type="password"
                placeholder="New Password"
                id="newPassword"
                name="newPassword"
              />
            </div>
            <div className={confirmPasswordOutletStyle.inputGroup}>
              <label
                htmlFor="confirmPassword"
                className={confirmPasswordOutletStyle.label}>
                Confirm Password :
              </label>

              <input
                className={confirmPasswordOutletStyle.input}
                type="password"
                placeholder="Confirm Password"
                id="confirmPassword"
                name="confirmPassword"
              />
            </div>
            <div className={confirmPasswordOutletStyle.buttonContainer}>
              <button
                className={confirmPasswordOutletStyle.resetButton}
                type="reset">
                Reset
              </button>
              <button
                className={confirmPasswordOutletStyle.submitButton}
                type="submit">
                {isPendingChangePassword ? "Submiting...." : "Change Password"}
              </button>
            </div>
          </fieldset>
        </form>
      </section>
    </main>
  );
};

export default ConfirmPasswordOutlet;
