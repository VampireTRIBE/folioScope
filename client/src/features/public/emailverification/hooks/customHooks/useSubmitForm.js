import { useCallback } from "react";
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";

export const useFormDataActions = () => {
  const { goToSendVerificationMail } = useNavigationActions();

  const submitFormEmailVerificationRetryData = useCallback(
    async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const values = Object.fromEntries(formData.entries());
      goToSendVerificationMail(values);
    },
    [goToSendVerificationMail],
  );

  return {
    submitFormEmailVerificationRetryData,
  };
};
