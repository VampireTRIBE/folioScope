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
        dispatch(singupErrorStateActions.SET_FORM_STATUS_TRUE());
        const response = await POST_SIGNUPFORM(values);
        dispatch(singupErrorStateActions.SET_FORM_STATUS_FALSE());
        dispatch(
          singupErrorStateActions.SET_SUCCESS({
            success: response?.success || true,
            message:
              response?.message ||
              "Signup Completed. Check your mail for Verification Link.",
          }),
        );
      } catch (err) {
        dispatch(singupErrorStateActions.SET_FORM_STATUS_FALSE());
        dispatch(singupErrorStateActions.RESET_SUCCESS());
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
