import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_ADDGROUPFORM } from "../../APIs/POST_APIs";

export const useAddGroupFormMutation = () => {
  return useMutation({
    mutationFn: POST_ADDGROUPFORM,
  });
};
