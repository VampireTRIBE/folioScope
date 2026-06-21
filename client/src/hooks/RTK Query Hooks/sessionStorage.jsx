import { useQuery } from "@tanstack/react-query";

// ! Session Storage Actions
import {
  getSessionSecurities,
  setSessionSecurities,
} from "../../utils/sessionStorage/securitySessionCache";

// ! APIs
import { FETCH_SECURITIESLIST } from "../../APIs/FETCH_APIs";

export const usePublicSecurities = () => {
  return useQuery({
    queryKey: ["publicSecurities"],
    queryFn: async () => {
      const cached = getSessionSecurities();
      if (cached) {
        return cached;
      }
      const securities = await FETCH_SECURITIESLIST();
      setSessionSecurities(securities);
      return securities;
    },

    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
};
