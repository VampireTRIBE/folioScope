export const selectActiveSignupFormError = (state) => {
  return {
    status: state.signupErrorState.formStatus,
    error: state.signupErrorState.formError.error,
    errorMessage: state.signupErrorState.formError.message,
    success: state.signupErrorState.formSuccess.success,
    successMessage: state.signupErrorState.formSuccess.message,
  };
};
