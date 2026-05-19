import { configureStore } from "@reduxjs/toolkit";

import headerToggle from "../features/public/header/redux/headerToggleState";
import todaysMarketToggle from "../features/public/home/redux/todaysMarketsState";
import securitychartRangeFilterState from "../features/public/securityDashbord/redux/securityPriceChartState";

const store = configureStore({
  reducer: {
    headerToggle,
    todaysMarketToggle,
    securitychartRangeFilterState,
  },
});

export default store;
