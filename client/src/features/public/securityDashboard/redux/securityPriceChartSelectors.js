export const selectActiveSecurityChartFilter = (state) => {
  const group = state.securitychartRangeFilterState.securityChartRange;
  return Object.keys(group).find((k) => group[k]);
};
