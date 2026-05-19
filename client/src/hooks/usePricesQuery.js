import { useQuery } from "@tanstack/react-query";
import { FETCH_RANGEPRICE } from "../api/priceApis";

export const use1DPriceRange = (securityID) => {
  return useQuery({
    queryKey: ["1DPrice", securityID],
    queryFn: () => FETCH_RANGEPRICE(securityID),
    enabled: !!securityID,
    refetchInterval: 10000,
  });
};

export const useChartRange = (securityID, range) => {
  return useQuery({
    queryKey: ["ChartRange", securityID, range],
    queryFn: () => FETCH_RANGEPRICE(securityID, range),
    enabled: !!securityID && !!range,
    refetchInterval: 10000,
  });
};
