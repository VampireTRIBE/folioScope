import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_SENDOTPEMAIL } from "../../APIs/POST_APIs";

export const useEmailOtpMutation = () => {
  return useMutation({
    mutationFn: POST_SENDOTPEMAIL,
  });
};
