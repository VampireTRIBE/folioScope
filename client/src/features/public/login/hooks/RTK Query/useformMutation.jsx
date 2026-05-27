import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_LOGINFORM } from "../../APIs/POST_APIs";

export const useLoginFormMutation = () => {
  return useMutation({
    mutationFn: POST_LOGINFORM,
  });
};