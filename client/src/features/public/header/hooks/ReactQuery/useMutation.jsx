import { useMutation } from "@tanstack/react-query";
import { POST_LOGOUT, POST_LOGOUTALL } from "../../api/POST_APIs";

// ! APIs

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: POST_LOGOUT,
  });
};

export const useLogoutALLMutation = () => {
  return useMutation({
    mutationFn: POST_LOGOUTALL,
  });
};
