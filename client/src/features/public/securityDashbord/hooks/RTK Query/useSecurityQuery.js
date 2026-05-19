import { useQuery } from "@tanstack/react-query";
import { FETCH_SECURITYOVERVIEW } from "../../api/fetchApis";

export const useSecurityOverview = (securityID) => {
  return useQuery({
    queryKey: ["securityOverview", securityID],
    queryFn: () => FETCH_SECURITYOVERVIEW(securityID),
    enabled: !!securityID,
    staleTime: 600000,
  });
};



