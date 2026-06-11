import { useQuery } from "@tanstack/react-query";

// ! APIs
import { FETCH_USERDETAILS } from "../../features/apis/FETCH_APIs";

export const useUserDetails = (accessToken, options = {}) => {
  return useQuery({
    queryKey: ["userDetails", accessToken],
    queryFn: () => FETCH_USERDETAILS(accessToken),
    enabled: !!accessToken,
    retry: false,
    staleTime: 20 * 60 * 1000,
    ...options,
  });
};