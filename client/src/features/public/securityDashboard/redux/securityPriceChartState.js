import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  W: true,
  M: false,
  Y: false,
  "3Y": false,
  MAX: false,
};

const securitychartRangeFilterState = createSlice({
  name: "securitychartRangeFilterState",
  initialState: {
    securityChartRange: { ...initialState },
  },
  reducers: {
    SECURITY_CHART_FILTER: (state, action) => {
      const key = action.payload?.key;
      if (!(key in state.securityChartRange)) return;
      Object.keys(state.securityChartRange).forEach((k) => {
        state.securityChartRange[k] = false;
      });
      state.securityChartRange[key] = true;
    },
  },
});

export const securitychartRangeFilterStateActions =
  securitychartRangeFilterState.actions;
export default securitychartRangeFilterState.reducer;
