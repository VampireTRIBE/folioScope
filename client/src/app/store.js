import { configureStore } from "@reduxjs/toolkit";

import publicheaderToggle from "../features/public/header/redux/headerToggleState";
import todaysMarketToggle from "../features/public/home/redux/todaysMarketsState";
import securitychartRangeFilterState from "../features/public/securityDashboard/redux/securityPriceChartState";

import groupchartRangeFilterState from "../features/protected/userDashboard/redux/groupPriceChartState";

import signupErrorState from "../features/public/signup/redux/signupFormState";

const store = configureStore({
  reducer: {
    publicheaderToggle,
    todaysMarketToggle,
    securitychartRangeFilterState,
    groupchartRangeFilterState,
    signupErrorState,
  },
});

export default store;
