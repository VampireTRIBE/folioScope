import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_VERIFYOTP } from "../../APIs/POST_APIs";

export const useEmailOtpMutation = () => {
  return useMutation({
    mutationFn: POST_VERIFYOTP,
  });
};
