import { useCallback } from "react";

export const useFormDataActions = () => {
  const submitNewRebalancerFormData = async (
    e,
    mutationFn,
    accessToken,
    assets,
    marketFallRules,
  ) => {
    const formData = new FormData(e.currentTarget);
    const values = Object.fromEntries(formData.entries());

    const payload = {
      portfolioGroupId: values.portfolioGroupId,
      rebalancerName: values.rebalancerName,
      rebalancerDescription: values.rebalancerDescription || "",
      assets,
      marketFallRules,
    };

    console.log("NEW REBALANCER PAYLOAD:", payload);

    return mutationFn({
      accessToken,
      data: payload,
    });
  };

  return {
    submitNewRebalancerFormData,
  };
};
