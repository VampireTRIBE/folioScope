import { useEffect } from "react";
import { useParams } from "react-router-dom";

// ! components 
import TextButton from "../../../../components/UI/buttons/TextButton";
import RequestStatus from "../../../../components/layout/public/requestStatus/RequestStatus";

// ! Styles
import emailVerificationStyle from "./emailverification.module.css";

// ! tanStack Query hook
import {
  useEmailSendVerificationMutation,
  useEmailVerificationMutation,
} from "../hooks/RTK Query/useEmailVerificationMutation";
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";
import { useFormDataActions } from "../hooks/customHooks/useSubmitForm";

const EmailVerificationOutlet = () => {
  const { emailToken } = useParams();
  const { goToLogin } = useNavigationActions();
  const { submitFormEmailVerificationRetryData } = useFormDataActions();

  const {
    mutate,
    isPending,
    isSuccess,
    isError,
    error,
    data: respData,
  } = useEmailVerificationMutation();

  useEffect(() => {
    if (emailToken) {
      mutate(emailToken);
    }
  }, [emailToken, mutate]);

  if (isSuccess) {
    setTimeout(() => {
      goToLogin();
    }, 2000);
  }

  return (
    <main className={emailVerificationStyle.container}>
      <section className={emailVerificationStyle.section}>
        <RequestStatus
          name={"Email Verification"}
          isPending={isPending}
          isSuccess={isSuccess}
          isError={isError}
          error={error}
          respData={respData}
        />

        <form
          onSubmit={submitFormEmailVerificationRetryData}
          className={emailVerificationStyle.form}>
          <div className={emailVerificationStyle.inputGroup}>
            <label htmlFor="email" className={emailVerificationStyle.label}>
              Email :
            </label>

            <input
              className={emailVerificationStyle.input}
              type="text"
              placeholder="xyz@gmail.com"
              id="email"
              name="email"
              required
            />
          </div>
          <TextButton
            type={"submit"}
            children={"Send Verification Mail Again"}
            variant={"buttonBlackSquare2"}
          />
        </form>
      </section>
    </main>
  );
};

export default EmailVerificationOutlet;
