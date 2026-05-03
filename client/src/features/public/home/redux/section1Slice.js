import { createSlice } from "@reduxjs/toolkit";

const HOME_DEFAULT_SECTION1 = createSlice({
  name: "HOME_DEFAULT_SECTION1",
  initialState: {
    data1: null,
    data2: null,
    data3: null,
  },
  reducers: {
    SET_SECTION_1_DATA: (state, action = null) => {
      console.log(action);
      if (!action || !action.payload) return;
      const { data1, data2, data3 } = action.payload;
      if (!data1 || !data2 || !data3) return;
      state.data1 = data1;
      state.data2 = data2;
      state.data3 = data3;
    },
  },
});

export const HOME_DEFAULT_SECTION1Actions = HOME_DEFAULT_SECTION1.actions;
export default HOME_DEFAULT_SECTION1.reducer;
