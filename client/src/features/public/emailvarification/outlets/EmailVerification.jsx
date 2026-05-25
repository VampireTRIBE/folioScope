import { useEffect } from "react";
import { useParams } from "react-router-dom";

// ! Styles
import emailVerificationStyle from "./emailverification.module.css";

// ! tanStack Query hook
import { useEmailVerificationMutation } from "../hooks/RTK Query/useEmailVerificationMutation";
import { useNavigationActions } from "../../../hooks/customHooks/useNavigationActions";

const EmailVerificationOutlet = () => {
  const { emailToken } = useParams();
  const { goToLogin } = useNavigationActions();

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
        <h2 className={emailVerificationStyle.title}>Email Verification</h2>
        <div className={emailVerificationStyle.content}>
          <div className={emailVerificationStyle.status}>
            <div
              className={`${emailVerificationStyle.statusLebal} ${isPending ? emailVerificationStyle.pending : ""} ${isSuccess ? emailVerificationStyle.success : ""} ${isError ? emailVerificationStyle.error : ""}`}>
              Status :
            </div>
            {isPending && <p>Verifying...</p>}
            {isSuccess && <p>Verified...</p>}
            {isError && <p>Failed...</p>}
          </div>

          <div className={emailVerificationStyle.status}>
            <div
              className={`${emailVerificationStyle.statusLebal} ${isPending ? emailVerificationStyle.pending : ""} ${isSuccess ? emailVerificationStyle.success : ""} ${isError ? emailVerificationStyle.error : ""}`}>
              Message :{" "}
            </div>
            {isSuccess && (
              <p>{respData?.message || "Email verified successfully"} ✅</p>
            )}

            {isError && (
              <p>
                {error?.response?.data?.message ||
                  "Email verification Failed Try After 1 Minute"}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};

export default EmailVerificationOutlet;
