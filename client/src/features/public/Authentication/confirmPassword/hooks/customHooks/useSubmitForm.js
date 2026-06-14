import { useCallback, useState } from "react";

export const useFormDataActions = () => {
  const [intialRender, SetInitalRender] = useState(true);

  const submitChangePassword = useCallback(async (e, mutateFn, email) => {
    e.preventDefault();
    SetInitalRender(false);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    await mutateFn({
      email,
      data,
    });
  }, []);

  return {
    submitChangePassword,
    intialRender,
    SetInitalRender,
  };
};
