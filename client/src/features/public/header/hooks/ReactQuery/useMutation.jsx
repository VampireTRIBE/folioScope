import { useMutation } from "@tanstack/react-query";

import { POST_LOGOUT, POST_LOGOUTALL } from "../../api/POST_APIs";

export const useLogoutMutation = () => {
  return useMutation({
    mutationFn: (accessToken) => POST_LOGOUT(accessToken),
  });
};

export const useLogoutALLMutation = () => {
  return useMutation({
    mutationFn: (accessToken) => POST_LOGOUTALL(accessToken),
  });
};