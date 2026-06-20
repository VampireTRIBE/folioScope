import { useCallback } from "react";

export const useLogoutActions = () => {
  const LogoutRequest = useCallback(async (mutationFn, accessToken) => {
    try {
      await mutationFn(accessToken);
    } catch {}
  }, []);

  return {
    LogoutRequest,
  };
};
