import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  profileToggle: false,
  menuToggle: false,
};

const publicheaderToggle = createSlice({
  name: "publicheaderToggle",
  initialState,

  reducers: {
    TOGGLE: (state, action) => {
      const key = action.payload?.key;
      if (!(key in state)) return;
      state[key] = !state[key];
      Object.keys(state).forEach((k) => {
        if (k !== key && state[key] !== false) {
          state[k] = state[key] ? false : true;
        }
      });
    },

    TOGGLE_RESET: (state) => {
      Object.keys(state).forEach((k) => {
        state[k] = false;
      });
    },
  },
});

export const publicheaderToggleActions = publicheaderToggle.actions;
export default publicheaderToggle.reducer;
