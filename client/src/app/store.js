import { configureStore } from "@reduxjs/toolkit";

import publicheaderToggle from "../features/public/header/redux/headerToggleState";
import todaysMarketToggle from "../features/public/home/redux/todaysMarketsState";
import securitychartRangeFilterState from "../features/public/securityDashbord/redux/securityPriceChartState";

import singupErrorState from "../features/public/signup/redux/singupFomState";

const store = configureStore({
  reducer: {
    publicheaderToggle,
    todaysMarketToggle,
    securitychartRangeFilterState,
    singupErrorState,
  },
});

export default store;
