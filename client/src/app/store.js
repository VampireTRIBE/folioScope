import { configureStore } from "@reduxjs/toolkit";

import headerToggle from "../features/public/header/redux/headerToggleState";
import HOME_DEFAULT_SECTION1 from "../features/public/home/redux/section1Slice";

const store = configureStore({
  reducer: {
    headerToggle,
    HOME_DEFAULT_SECTION1,
  },
});

export default store;
