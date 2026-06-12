import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  W: true,
  M: false,
  Y: false,
  "3Y": false,
  MAX: false,
};

const groupchartRangeFilterState = createSlice({
  name: "groupchartRangeFilterState",
  initialState: {
    groupChartRange: { ...initialState },
  },
  reducers: {
    GROUP_CHART_FILTER: (state, action) => {
      const key = action.payload?.key;
      if (!(key in state.groupChartRange)) return;
      Object.keys(state.groupChartRange).forEach((k) => {
        state.groupChartRange[k] = false;
      });
      state.groupChartRange[key] = true;
    },
  },
});

export const groupchartRangeFilterStateActions =
  groupchartRangeFilterState.actions;
export default groupchartRangeFilterState.reducer;
