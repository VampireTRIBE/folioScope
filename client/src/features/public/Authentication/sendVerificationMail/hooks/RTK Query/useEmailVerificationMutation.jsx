import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_SENDVERIFICATIONEMAIL } from "../../APIs/POST_APIs";

export const useEmailSendVerificationMutation = () => {
  return useMutation({
    mutationFn: POST_SENDVERIFICATIONEMAIL,
  });
};
