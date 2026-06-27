import { useQuery } from "@tanstack/react-query";

// ! APIs
import {
  FETCH_REBALANCER,
  FETCH_REBALANCERLIST,
} from "../../APIs/FETCH_APIs";

export const useRebalancerListQuery = (accessToken) => {
  return useQuery({
    queryKey: ["RebalancerList"],
    queryFn: () => FETCH_REBALANCERLIST(accessToken),
    enabled: !!accessToken,
    staleTime: 30000,
  });
};

export const useRebalancerQuery = (accessToken, rebalancerId) => {
  return useQuery({
    queryKey: ["Rebalancer", rebalancerId],
    queryFn: () => FETCH_REBALANCER(accessToken, rebalancerId),
    enabled: !!accessToken && !!rebalancerId,
    staleTime: 30000,
  });
};
