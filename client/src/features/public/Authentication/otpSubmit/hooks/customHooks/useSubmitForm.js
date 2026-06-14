import { useCallback, useState } from "react";

export const useFormDataActions = () => {
  const [intialRender, SetInitalRender] = useState(true);

  const submitFormOtpVerify = useCallback(async (e, mutateFn, email) => {
    e.preventDefault();
    SetInitalRender(false);

    const formData = new FormData(e.target);
    const values = Object.fromEntries(formData.entries());

    const otp = Object.values(values).join("").trim();
    await mutateFn({
      email,
      otp,
    });
  }, []);

  return {
    submitFormOtpVerify,
    intialRender,
    SetInitalRender,
  };
};
