const selectGroupFormState = (state) => state.groupFormState ?? {};

export const selectGroupFormByKey = (key) => (state) =>
  selectGroupFormState(state)[key] ?? false;

export const selectActiveGroupForm = (state) =>
  Object.entries(selectGroupFormState(state)).find(([, value]) => value)?.[0] ??
  null;

export const selectIsAnyGroupFormOpen = (state) =>
  Object.values(selectGroupFormState(state)).some(Boolean);