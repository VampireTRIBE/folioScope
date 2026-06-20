import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  buy: true,
  sell: false,
  dividend: false,
};

const tradeTransactionState = createSlice({
  name: "tradeTransactionState",
  initialState,
  reducers: {
    TRADE_FROM_TRANSACTION_FILTER: (state, action) => {
      const key = action.payload?.key;
      if (!key || !(key in state)) return;
      Object.keys(state).forEach((k) => {
        state[k] = k === key ? !state[k] : false;
      });
    },

    TRADE_FORM_TRANSACTION_FILTER_RESET: () => {
      return initialState;
    },
  },
});

export const tradeTransactionStateActions = tradeTransactionState.actions;
export default tradeTransactionState.reducer;
