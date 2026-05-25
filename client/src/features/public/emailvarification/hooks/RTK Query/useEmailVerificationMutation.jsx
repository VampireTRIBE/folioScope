import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_VERIFYEMAIL } from "../../APIs/POST_APIs";

export const useEmailVerificationMutation = () => {
  return useMutation({
    mutationFn: POST_VERIFYEMAIL,
  });
};
