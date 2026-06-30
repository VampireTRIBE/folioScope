import { useCallback } from "react";

export const useLogoutActions = () => {
  const LogoutRequest = useCallback(
    async ({ mutation, accessToken, onSuccess, onError }) => {
      try {
        if (!mutation?.mutateAsync) {
          throw new Error("Invalid logout mutation. mutateAsync is missing.");
        }

        if (!accessToken) {
          onSuccess?.();
          return null;
        }

        const result = await mutation.mutateAsync(accessToken);

        onSuccess?.(result);

        return result;
      } catch (error) {
        console.error("Logout failed:", error);

        onError?.(error);

        return null;
      }
    },
    [],
  );

  return {
    LogoutRequest,
  };
};
