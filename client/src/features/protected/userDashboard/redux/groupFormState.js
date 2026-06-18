import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  addGroup: false,
  updateGroup: false,
  deleteGroup: false,
  trade: false,
};

const groupFormState = createSlice({
  name: "groupFormState",
  initialState,
  reducers: {
    GROUP_FORM_FILTER: (state, action) => {
      const key = action.payload?.key;
      if (!key || !(key in state)) return;
      Object.keys(state).forEach((k) => {
        state[k] = k === key ? !state[k] : false;
      });
    },

    GROUP_FORM_FILTER_RESET: () => {
      return initialState;
    },
  },
});

export const groupFormStateActions = groupFormState.actions;
export default groupFormState.reducer;
