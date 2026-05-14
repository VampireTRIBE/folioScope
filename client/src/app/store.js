import { configureStore } from "@reduxjs/toolkit";

import headerToggle from "../features/public/header/redux/headerToggleState";
import todaysMarketToggle from "../features/public/home/redux/todaysMarketsState";

const store = configureStore({
  reducer: {
    headerToggle,
    todaysMarketToggle,
  },
});

export default store;
