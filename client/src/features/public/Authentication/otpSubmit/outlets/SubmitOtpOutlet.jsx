import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// ! components
import TextButton from "../../../../../components/UI/buttons/TextButton";
import RequestStatus from "../../../../../components/layout/public/requestStatus/RequestStatus";

// ! Styles
import submitOtpOutletStyle from "./submitotpoutlet.module.css";

// ! custom hooks
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";
import { useFormDataActions } from "../hooks/customHooks/useSubmitForm";

// ! tanStack Query hook
import { useEmailOtpMutation } from "../hooks/RTK Query/useFormMutation";

const SubmitOtpOutlet = () => {
  const { goToForgotPassword, goToSendVerificationMail, goToConfirmPassword } =
    useNavigationActions();
  const { intialRender, SetInitalRender, submitFormOtpVerify } =
    useFormDataActions();
  const { state } = useLocation();

  const {
    mutateAsync: OTPFormMutationFn,
    isPending: isPendingOTPForm,
    isSuccess: isSuccessOTPForm,
    isError: isErrorOTPForm,
    error: errorOTPForm,
    data: respOTPForm,
  } = useEmailOtpMutation();

  const inp = ["", "", "", "", "", ""];

  useEffect(() => {
    if (errorOTPForm?.response?.data?.message === "VERIFYEMAIL") {
      goToSendVerificationMail();
    }
  }, [errorOTPForm, goToSendVerificationMail]);

  useEffect(() => {
    if (isSuccessOTPForm) {
      goToConfirmPassword(state?.email);
    }
  }, [state, isSuccessOTPForm, goToConfirmPassword]);

  return (
    <main className={submitOtpOutletStyle.container}>
      <section className={submitOtpOutletStyle.section}>
        {!intialRender && (
          <RequestStatus
            name={"Verify OTP"}
            isPending={isPendingOTPForm}
            isSuccess={isSuccessOTPForm}
            isError={isErrorOTPForm}
            error={errorOTPForm}
            respData={respOTPForm}
            state={{
              pending: "Verifing OTP",
              error: "OTP Verification Failed",
            }}
          />
        )}

        <form
          onSubmit={(e) =>
            submitFormOtpVerify(e, OTPFormMutationFn, state?.email)
          }
          className={submitOtpOutletStyle.form}>
          <fieldset
            className={submitOtpOutletStyle.fieldset}
            disabled={isPendingOTPForm}>
            {intialRender && <legend>Verify OTP</legend>}
            <div className={submitOtpOutletStyle.inputGroup}>
              {inp.map((_, indx) => (
                <input
                  key={indx}
                  className={submitOtpOutletStyle.input}
                  type="text"
                  id={`o${indx}`}
                  name={`o${indx}`}
                  placeholder="-"
                  maxLength={1}
                  minLength={1}
                  required
                />
              ))}
            </div>
            <div className={submitOtpOutletStyle.btnContainer}>
              <TextButton
                type={"button"}
                children={"Resend OTP"}
                variant={"buttonBlackSquare2"}
                onClick={goToForgotPassword}
              />
              <TextButton
                type={"submit"}
                children={"Submit OTP"}
                variant={"buttonBlackSquare2"}
              />
            </div>
          </fieldset>
        </form>
      </section>
    </main>
  );
};

export default SubmitOtpOutlet;
