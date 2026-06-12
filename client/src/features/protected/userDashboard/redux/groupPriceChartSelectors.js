export const selectActiveGroupChartFilter = (state) => {
  const group = state.groupchartRangeFilterState.groupChartRange;
  return Object.keys(group).find((k) => group[k]);
};
