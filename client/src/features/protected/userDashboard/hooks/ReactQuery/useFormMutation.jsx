import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_ADDGROUPFORM, POST_GROUPTRANSACTION } from "../../APIs/POST_APIs";
import { PATCH_UPDATEGROUPFORM } from "../../APIs/PATCH_APIs";

export const useAddGroupFormMutation = () => {
  return useMutation({
    mutationFn: POST_ADDGROUPFORM,
  });
};

export const useUpdateGroupFormMutation = () => {
  return useMutation({
    mutationFn: PATCH_UPDATEGROUPFORM,
  });
};

export const useGroupTransactionFormMutation = () => {
  return useMutation({
    mutationFn: POST_GROUPTRANSACTION,
  });
};
