export const selectActiveFilterByGroup = (key) => (state) => {
  const group = state.todaysMarketToggle?.filterToggle?.[key];
  if (!group) return null;
  return {
    category: key,
    subCategory: Object.keys(group).find((key) => group[key]),
  };
};

export const selectActiveSubFilterByGroup =
  (category, subCategory) => (state) => {
    const group =
      state.todaysMarketToggle?.subFilterToggle?.[category]?.[subCategory];
    if (!group) return null;
    return {
      category,
      subCategory,
      activeFilter: Object.keys(group).find((key) => group[key]),
    };
  };
