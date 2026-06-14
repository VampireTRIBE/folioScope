import { useCallback, useState } from "react";

export const useFormDataActions = () => {
  const [intialRender, SetInitalRender] = useState(true);

  const submitFormOtpMail = useCallback(async (e, mutateFn) => {
    e.preventDefault();
    SetInitalRender(false);
    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());
    await mutateFn(values);
  }, []);

  return {
    submitFormOtpMail,
    intialRender,
  };
};
