import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  deposit: true,
  withdrawal: false,
  tax: false,
};

const groupTransactionState = createSlice({
  name: "groupTransactionState",
  initialState,
  reducers: {
    GROUP_FROM_TRANSACTION_FILTER: (state, action) => {
      const key = action.payload?.key;
      if (!key || !(key in state)) return;
      Object.keys(state).forEach((k) => {
        state[k] = k === key ? !state[k] : false;
      });
    },

    GROUP_FORM_TRANSACTION_FILTER_RESET: () => {
      return initialState;
    },
  },
});

export const groupTransactionStateActions = groupTransactionState.actions;
export default groupTransactionState.reducer;
