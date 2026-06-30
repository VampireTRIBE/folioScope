import { useEffect } from "react";

// ! components
import TextButton from "../../../../../components/UI/buttons/TextButton";
import RequestStatus from "../../../../../components/layout/public/requestStatus/RequestStatus";

// ! Styles
import sendOTPmailOutletStyle from "./sendotpmailoutlet.module.css";

// ! custom hooks
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";
import { useFormDataActions } from "../hooks/customHooks/useSubmitForm";

// ! tanStack Query hook
import { useEmailOtpMutation } from "../hooks/RTK Query/useFormMutation";

const SendOTPMailOutlet = () => {
  const { goToSubmitOtp, goToSendVerificationMail } = useNavigationActions();
  const { intialRender, submitFormOtpMail } = useFormDataActions();

  const {
    mutateAsync: OTPFormMutationFn,
    isPending: isPendingOTPForm,
    isSuccess: isSuccessOTPForm,
    isError: isErrorOTPForm,
    error: errorOTPForm,
    data: respOTPForm,
  } = useEmailOtpMutation();

  useEffect(() => {
    if (errorOTPForm?.response?.data?.message === "VERIFYEMAIL") {
      goToSendVerificationMail();
    }
  }, [errorOTPForm, goToSendVerificationMail]);

  useEffect(() => {
    if (isSuccessOTPForm) {
      goToSubmitOtp(respOTPForm?.email);
    }
  }, [isSuccessOTPForm, goToSubmitOtp, respOTPForm?.email]);

  return (
    <main className={sendOTPmailOutletStyle.container}>
      <section className={sendOTPmailOutletStyle.section}>
        {!intialRender && (
          <RequestStatus
            name={"Send OTP"}
            isPending={isPendingOTPForm}
            isSuccess={isSuccessOTPForm}
            isError={isErrorOTPForm}
            error={errorOTPForm}
            respData={respOTPForm}
            state={{ pending: "Sending OTP", error: "Failed to send OTP" }}
          />
        )}

        <form
          onSubmit={(e) => submitFormOtpMail(e, OTPFormMutationFn)}
          className={sendOTPmailOutletStyle.form}>
          <fieldset
            className={sendOTPmailOutletStyle.fieldset}
            disabled={isPendingOTPForm}>
            <div className={sendOTPmailOutletStyle.inputGroup}>
              <label htmlFor="email" className={sendOTPmailOutletStyle.label}>
                Email :
              </label>

              <input
                className={sendOTPmailOutletStyle.input}
                type="text"
                placeholder="xyz@gmail.com"
                id="email"
                name="email"
                required
                autoComplete="true"
              />
            </div>
            <TextButton
              type={"submit"}
              children={"Send OTP"}
              variant={"buttonBlackSquare2"}
            />
          </fieldset>
        </form>
      </section>
    </main>
  );
};

export default SendOTPMailOutlet;
