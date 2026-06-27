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
      sipAmount: Number(values.sipAmount),
      rebalancerName: values.rebalancerName,
      rebalancerDescription: values.rebalancerDescription || "",
      assets,
      marketFallRules,
    };

    return mutationFn({
      accessToken,
      data: payload,
    });
  };

  return {
    submitNewRebalancerFormData,
  };
};
