import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_NEWREBALANCER } from "../../APIs/POST_APIs";

export const useNewRebalancerFormMutation = () => {
  return useMutation({
    mutationFn: POST_NEWREBALANCER,
  });
};
