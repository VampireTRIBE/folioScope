import { useCallback } from "react";

export const useFormDataActions = () => {
  const submitFormAddGroupData = useCallback(
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
      } catch {}
    },
    [],
  );

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
      } catch {}
    },
    [],
  );

  const submitFormGroupTransactionData = useCallback(
    async (e, mutationFn, transactionType, accessToken, groupId) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const values = Object.fromEntries(formData.entries());
      let finalDate = null;
      if (values.date) {
        const [year, month, day] = values.date.split("-").map(Number);
        const now = new Date();
        finalDate = new Date(
          year,
          month - 1,
          day,
          now.getHours(),
          now.getMinutes(),
          now.getSeconds(),
          now.getMilliseconds(),
        ).toISOString();
      }

      const payload = {
        ...values,
        type: transactionType,
        date: finalDate,
      };

      try {
        await mutationFn({
          accessToken,
          groupId,
          data: payload,
        });
      } catch (error) {
        console.error(error);
      }
    },
    [],
  );

  return {
    submitFormAddGroupData,
    submitFormUpdateGroupData,
    submitFormGroupTransactionData,
  };
};
