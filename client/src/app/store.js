import { configureStore } from "@reduxjs/toolkit";

import publicheaderToggle from "../features/public/header/redux/headerToggleState";
import todaysMarketToggle from "../features/public/home/redux/todaysMarketsState";
import securitychartRangeFilterState from "../features/public/securityDashbord/redux/securityPriceChartState";

import groupchartRangeFilterState from "../features/protected/userDashboard/redux/groupPriceChartState";

import singupErrorState from "../features/public/signup/redux/singupFomState";

const store = configureStore({
  reducer: {
    publicheaderToggle,
    todaysMarketToggle,
    securitychartRangeFilterState,
    groupchartRangeFilterState,
    singupErrorState,
  },
});

export default store;
