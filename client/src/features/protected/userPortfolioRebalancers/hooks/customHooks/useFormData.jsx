import { useCallback } from "react";

export const useFormDataActions = () => {
  // const submitFilterHoldingData = useCallback(
  //   async (e, mutationFn, accessToken, onSubmitGroup) => {
  //     e.preventDefault();
  //     const formData = new FormData(e.currentTarget);
  //     const values = Object.fromEntries(formData.entries());
  //     try {
  //       const response = await mutationFn({
  //         accessToken,
  //         data: values,
  //       });
  //       onSubmitGroup?.(values.groupId);
  //       return response;
  //     } catch {
  //       return null;
  //     }
  //   },
  //   [],
  // );

  return {
    // submitFilterHoldingData,
  };
};
