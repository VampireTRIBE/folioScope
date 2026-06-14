import { useContext, useEffect } from "react";
import { useParams } from "react-router-dom";

// ! components
import TextButton from "../../../../../components/UI/buttons/TextButton";
import RequestStatus from "../../../../../components/layout/public/requestStatus/RequestStatus";

// ! Styles
import emailVerificationStyle from "./emailverification.module.css";

// ! tanStack Query hook
import { useEmailVerificationMutation } from "../hooks/RTK Query/useEmailVerificationMutation";
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";
import { useFormDataActions } from "../hooks/customHooks/useSubmitForm";

// ! Context
import { AuthenticationContext } from "../../../../../context/authenticationContext";

const EmailVerificationOutlet = () => {
  const { setAccessToken, setUserData } = useContext(AuthenticationContext);
  const { emailToken } = useParams();
  const { goToUserDashboard } = useNavigationActions();
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
    setAccessToken(respData?.accessToken);
    setUserData(respData?.user || null);
    setTimeout(() => {
      goToUserDashboard(
        1,
        `${respData?.user?.groups?.level1?.["NET WORTH"]?.name}`,
      );
    }, 200);
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
