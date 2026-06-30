import { useCallback, useRef } from "react";

export const useFormDataActions = () => {
  const submittedData = useRef(null);

  const submitFormLoginData = useCallback(async (e, mutationFn) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    submittedData.current = { email: values?.email };
    mutationFn(values);
  }, []);

  return {
    submitFormLoginData,
    submittedData,
  };
};
