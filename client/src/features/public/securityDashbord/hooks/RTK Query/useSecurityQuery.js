import { useQuery } from "@tanstack/react-query";
import {
  FETCH_SECURITYDRAWDOWN,
  FETCH_SECURITYOVERVIEW,
} from "../../api/fetchApis";

export const useSecurityOverview = (securityID) => {
  return useQuery({
    queryKey: ["securityOverview", securityID],
    queryFn: () => FETCH_SECURITYOVERVIEW(securityID),
    enabled: !!securityID,
    staleTime: 600000,
  });
};

export const useSecurityDrawdown = (securityID) => {
  return useQuery({
    queryKey: ["securityDrawdown", securityID],
    queryFn: () => FETCH_SECURITYDRAWDOWN(securityID),
    enabled: !!securityID,
    staleTime: 30000,
  });
};
