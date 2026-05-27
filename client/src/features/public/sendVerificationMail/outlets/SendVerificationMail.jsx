import { useEffect } from "react";
import { useLocation, useParams } from "react-router-dom";

// ! components
import TextButton from "../../../../components/UI/buttons/TextButton";
import RequestStatus from "../../../../components/layout/public/requestStatus/RequestStatus";

// ! Styles
import sendverificationmailStyle from "./sendverificationmail.module.css";

// ! custom hooks
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";
import { useFormDataActions } from "../hooks/customHooks/useSubmitForm";

// ! tanStack Query hook
import { useEmailSendVerificationMutation } from "../hooks/RTK Query/useEmailVerificationMutation";

const SendVerificationMailOutlet = () => {
  const { goToLogin } = useNavigationActions();
  const { state } = useLocation();
  const { submitFormEmailVerificationRetryData } = useFormDataActions();

  let {
    mutate,
    isPending,
    isSuccess,
    isError,
    error,
    data: respData,
  } = useEmailSendVerificationMutation();

  useEffect(() => {
    if (state) {
      mutate(state);
    }
  }, [state, mutate]);

  const customError = !state
    ? {
        response: {
          data: {
            message: "Please provide your email.",
          },
        },
      }
    : null;

  if (isSuccess) {
    return (
      <main className={sendverificationmailStyle.container}>
        <section className={sendverificationmailStyle.section}>
          <RequestStatus
            name={"Send Verification Mail"}
            isPending={isPending}
            isSuccess={isSuccess}
            isError={!!customError || isError}
            error={customError || error}
            respData={respData}
            state={{ success: "Mail Sent" }}
          />
        </section>
      </main>
    );
  }

  return (
    <main className={sendverificationmailStyle.container}>
      <section className={sendverificationmailStyle.section}>
        <RequestStatus
          name={"Send Verification Mail"}
          isPending={isPending}
          isSuccess={isSuccess}
          isError={!!customError || isError}
          error={customError || error}
          respData={respData}
          state={{ pending: "Sending Mail", error: "Failed to send Mail" }}
        />

        <form
          onSubmit={submitFormEmailVerificationRetryData}
          className={sendverificationmailStyle.form}>
          <div className={sendverificationmailStyle.inputGroup}>
            <label htmlFor="email" className={sendverificationmailStyle.label}>
              Email :
            </label>

            <input
              className={sendverificationmailStyle.input}
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
            children={"Send Verification Mail Again"}
            variant={"buttonBlackSquare2"}
          />
        </form>
      </section>
    </main>
  );
};

export default SendVerificationMailOutlet;
