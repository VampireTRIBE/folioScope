export const selectActiveSingupFormError = (state) => {
  return {
    status: state.singupErrorState.formStatus,
    error: state.singupErrorState.formError.error,
    errorMessage: state.singupErrorState.formError.message,
    success: state.singupErrorState.formSuccess.success,
    successMessage: state.singupErrorState.formSuccess.message,
  };
};
