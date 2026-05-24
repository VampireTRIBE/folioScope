import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  error: false,
  message: "",
};

const singupErrorState = createSlice({
  name: "singupErrorState",
  initialState: {...initialState},
  reducers: {
    SET_ERROR: (state, action) => {
      const { error, message } = action.payload;
      if (!error || !message) return;
      state.error = error;
      state.message = message;
    },

    RESET_ERROR: (state) => {
      state.error = false;
      state.message = "";
    },
  },
});

export const singupErrorStateActions = singupErrorState.actions;
export default singupErrorState.reducer;
