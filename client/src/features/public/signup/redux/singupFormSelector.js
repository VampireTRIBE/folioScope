export const selectActiveSingupFormError = (state) => {
  return {
    error: state.singupErrorState.error,
    message: state.singupErrorState.message,
  };
};
