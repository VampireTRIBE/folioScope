export const selectActiveFilterByKey = (key) => (state) => {
  const group = state.todaysMarketToggle?.filterToggle?.[key];
  if (!group) return null;
  return {
    category: key,
    active: Object.keys(group).find((key) => group[key]),
  };
};
