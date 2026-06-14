import { useCallback, useRef, useState } from "react";

// ! Custom Hooks
import { useNavigationActions } from "../../../../../hooks/customHooks/useNavigationActions";

export const useFormDataActions = () => {
  const { goToEmailVerification } = useNavigationActions();
  const submittedData = useRef(null);

  const submitFormLoginData = useCallback(async (e, mutationFn) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    submittedData.current = { email: values?.email } || {};
    mutationFn(values);
  }, []);

  return {
    submitFormLoginData,
    submittedData,
  };
};
