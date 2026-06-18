import { useMutation } from "@tanstack/react-query";

// ! APIs
import { PATCH_UPDATEGROUPFORM } from "../../APIs/PATCH_APIs";

export const useUpdateGroupFormMutation = () => {
  return useMutation({
    mutationFn: PATCH_UPDATEGROUPFORM,
  });
};
