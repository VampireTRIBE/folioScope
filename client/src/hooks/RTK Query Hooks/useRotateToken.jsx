import { useMutation } from "@tanstack/react-query";

// ! APIs
import { POST_TOKENROTATION } from "../../APIs/FETCH_APIs";

export const useRotateTokenMutation = () => {
  return useMutation({
    mutationFn: POST_TOKENROTATION,
  });
};
