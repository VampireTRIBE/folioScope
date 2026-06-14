import { useQuery } from "@tanstack/react-query";

// ! APIs
import { FETCH_GROUPMETADATA } from "../../APIs/FETCH_APIs";
import {
  FETCH_GROUPDRAWDOWN,
  FETCH_RANGENAVGROUP,
} from "../../../../apis/FETCH_APIs";

export const useGROUPMETADATA = (accessToken, gp_id) => {
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

export const use1DNavRangeGroup = (groupid, accessToken) => {
  return useQuery({
    queryKey: ["1DPrice", groupid],
    queryFn: () => FETCH_RANGENAVGROUP(groupid, accessToken),
    enabled: !!groupid,
    refetchInterval: 10000,
  });
};

export const useNavGroupChartRange = (groupid, accessToken, range) => {
  return useQuery({
    queryKey: ["ChartRange", groupid, range],
    queryFn: () => FETCH_RANGENAVGROUP(groupid, accessToken, range),
    enabled: !!groupid && !!range,
    refetchInterval: 10000,
  });
};

export const useGroupDrawdown = (groupId, accessToken) => {
  return useQuery({
    queryKey: ["GroupDrawdown", groupId],
    queryFn: () => FETCH_GROUPDRAWDOWN(groupId, accessToken),
    enabled: !!groupId,
    staleTime: 30000,
  });
};
