import { createSlice } from "@reduxjs/toolkit";

const subFilterStates = {
  gainers: true,
  losers: false,
  near52WHigh: false,
  near52WLow: false,
};

const stocksInitialFilterStates = {
  LargeCap: true,
  MidCap: false,
  SmallCap: false,
};

const etfsInitialFilterStates = {
  Equity: true,
  Sectoral: false,
  International: false,
};

const mfsInitialFilterStates = {
  Equity: true,
  Debt: false,
  Others: false,
};

const stocksInitialSubFilterStates = {
  LargeCap: { ...subFilterStates },
  MidCap: { ...subFilterStates },
  SmallCap: { ...subFilterStates },
};

const etfsInitialSubFilterStates = {
  Equity: { ...subFilterStates },
  Sectoral: { ...subFilterStates },
  International: { ...subFilterStates },
};

const mfsInitialSubFilterStates = {
  Equity: { ...subFilterStates },
  Debt: { ...subFilterStates },
  Others: { ...subFilterStates },
};

const filterStates = {
  Stocks: { ...stocksInitialFilterStates },
  Etfs: {
    ...etfsInitialFilterStates,
  },
  "Mutual Funds": { ...mfsInitialFilterStates },
};

const subFilterState = {
  Stocks: { ...stocksInitialSubFilterStates },
  Etfs: {
    ...etfsInitialSubFilterStates,
  },
  "Mutual Funds": { ...mfsInitialSubFilterStates },
};

const todaysMarketToggle = createSlice({
  name: "todaysMarketToggle",
  initialState: {
    filterToggle: { ...filterStates },
    subFilterToggle: { ...subFilterState },
  },
  reducers: {
    FILTER_TOGGLE: (state, action) => {
      const key = action.payload?.key;
      const group = state.filterToggle?.[key];
      if (!group) return;
      const keys = Object.keys(group);
      const currentIndex = keys.findIndex((k) => group[k] === true);
      if (currentIndex === -1) {
        group[keys[0]] = true;
        return;
      }
      group[keys[currentIndex]] = false;
      const nextIndex = (currentIndex + 1) % keys.length;
      group[keys[nextIndex]] = true;
    },

    SUB_FILTER_TOGGLE: (state, action) => {
      const { key1, key2, subKey } = action.payload;
      const group = state.subFilterToggle?.[key1]?.[key2];
      if (!group || !(subKey in group)) return;
      Object.keys(group).forEach((k) => {
        group[k] = false;
      });
      group[subKey] = true;
    },
  },
});

export const todaysMarketToggleActions = todaysMarketToggle.actions;
export default todaysMarketToggle.reducer;
