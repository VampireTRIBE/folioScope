import { configureStore } from "@reduxjs/toolkit";

import headerToggle from "./toogleState/headerToggleStates";

const store = configureStore({
  reducer: {
    headerToggle,
  },
});

export default store;
