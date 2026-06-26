import { useCallback } from "react";

export const useFormDataActions = () => {
  const submitNewRebalancerFormData = useCallback(
    async (e, mutationFn, accessToken, assets) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const values = Object.fromEntries(formData.entries());

      const payload = {
        portfolioGroupId: values.groupId,
        rebalancerName: values.rebalancerName,
        rebalancerDescription: values.rebalancerDescription,
        assets,
      };

      try {
        return await mutationFn({
          accessToken,
          data: payload,
        });
      } catch {}
    },
    [],
  );

  return {
    submitNewRebalancerFormData,
  };
};
