import { useCallback } from "react";
import { useDispatch } from "react-redux";

// ! APIs
import { POST_SIGNUPFORM } from "../../api/POST_apis";

// ! Disptch Actions
import { singupErrorStateActions } from "../../redux/singupFomState";

// ! Custom Hooks
import { useNavigationActions } from "../../../../hooks/customHooks/useNavigationActions";

export const useFormDataActions = () => {
  const { goToEmailVerification } = useNavigationActions();
  const dispatch = useDispatch();

  const submitFormSignupData = useCallback(
    async (e) => {
      e.preventDefault();

      try {
        const formData = new FormData(e.target);
        const values = Object.fromEntries(formData.entries());
        const response = await POST_SIGNUPFORM(values);
        console.log(response);
        dispatch(singupErrorStateActions.RESET_ERROR());
        goToEmailVerification();
      } catch (err) {
        dispatch(
          singupErrorStateActions.SET_ERROR({
            error: true,
            message:
              err?.response?.data?.message || err.message || "Signup failed",
          }),
        );
      }
    },
    [dispatch],
  );

  return {
    submitFormSignupData,
  };
};
