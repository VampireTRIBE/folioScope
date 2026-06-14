import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_CHANGEPASSWORD } from "../../APIs/POST_APIs";

export const useChangePasswordMutation = () => {
  return useMutation({
    mutationFn: POST_CHANGEPASSWORD,
  });
};
