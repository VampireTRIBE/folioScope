import { useMutation } from "@tanstack/react-query";

// ! APIs

import { FETCH_USERSHOLDINGS } from "../../APIs/FETCH_APIs";

export const useFilterHoldingsFormMutation = () => {
  return useMutation({
    mutationFn: FETCH_USERSHOLDINGS,
  });
};
