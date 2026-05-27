import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_VERIFYEMAIL, POST_SENDVERIFICATIONEMAIL } from "../../APIs/POST_APIs";

export const useEmailVerificationMutation = () => {
  return useMutation({
    mutationFn: POST_VERIFYEMAIL,
  });
};

export const useEmailSendVerificationMutation = () => {
  return useMutation({
    mutationFn: POST_SENDVERIFICATIONEMAIL,
  });
};
