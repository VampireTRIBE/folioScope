import { useQuery } from "@tanstack/react-query";

// ! APIs
import { FETCH_GROUPMETADATA } from "../../APIs/FETCH_APIs";

export const useGROUPMETADATA = (accessToken, gp_id = "null") => {
  return useQuery({
    queryKey: ["GroupMeatadata", gp_id],
    queryFn: () => FETCH_GROUPMETADATA(accessToken, gp_id),
    enabled: !!gp_id,
    refetchInterval: 10000,
    staleTime: 10000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
};
