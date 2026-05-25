import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  formStatus: false,
  formError: {
    error: false,
    message: "",
  },
  formSuccess: {
    success: false,
    message: "",
  },
};

const singupErrorState = createSlice({
  name: "singupErrorState",
  initialState: { ...initialState },
  reducers: {
    SET_ERROR: (state, action) => {
      const { error, message } = action.payload;
      if (!error || !message) return;
      state.formError.error = error;
      state.formError.message = message;
    },
    RESET_ERROR: (state) => {
      state.formError.error = false;
      state.formError.message = "";
    },

    SET_SUCCESS: (state, action) => {
      const { success, message } = action.payload;
      if (!success || !message) return;
      state.formSuccess.success = success;
      state.formSuccess.message = message;
    },

    RESET_SUCCESS: (state) => {
      state.formSuccess.success = false;
      state.formSuccess.message = "";
    },

    SET_FORM_STATUS_TRUE: (state) => {
      state.formStatus = true;
    },

    SET_FORM_STATUS_FALSE: (state) => {
      state.formStatus = false;
    },
  },
});

export const singupErrorStateActions = singupErrorState.actions;
export default singupErrorState.reducer;
