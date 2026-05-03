import { createSlice } from "@reduxjs/toolkit";

const headerToggle = createSlice({
  name: "headerToggle",
  initialState: { profileToggle: false, menuToggle: false },
  reducers: {
    TOGGLE: (state, action = null) => {
      console.log(action)
      if (!action || !action.payload) return;
      const { payload } = action;
      if (!payload.key || !(payload.key in state)) return;
      state[payload.key] = !state[payload.key];
    },

    TOGGLE_FALSE: (state, action = null) => {
      if (!action || !action.payload) return;
      const { payload } = action;
      if (!payload.key || !state[payload.key]) return;
      state[payload.key] = false;
    },

    TOGGLE_RESET: (state) => {
      state.profileToggle = false;
      state.menuToggle = false;
    },
  },
});

export const headerToggleActions = headerToggle.actions;
export default headerToggle.reducer;
