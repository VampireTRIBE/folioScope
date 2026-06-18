import { useCallback } from "react";

export const useFormDataActions = () => {
  const submitFormUpdateGroupData = useCallback(
    async (e, mutationFn, accessToken, groupId) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const values = Object.fromEntries(formData.entries());

      try {
        await mutationFn({
          accessToken,
          groupId,
          data: values,
        });
      } catch {
        // React Query exposes the error to the form component.
      }
    },
    [],
  );

  return {
    submitFormUpdateGroupData,
  };
};
