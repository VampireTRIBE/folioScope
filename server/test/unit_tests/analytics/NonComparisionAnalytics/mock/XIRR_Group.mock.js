// test/unit_tests/xirr/mock/XIRR_Group.mock.js

const mockIds = {
  userId: "64f000000000000000000001",
  groupId: "64f000000000000000000002",
  leafGroupId1: "64f000000000000000000003",
  leafGroupId2: "64f000000000000000000004",
};

const mockSession = {
  id: "mock-session-id",
};

const mockCurrentValue = 125000;

const fixedToday = "2026-06-29T11:30:00.000Z";

const fixedTodayMidnight = new Date("2026-06-29T00:00:00.000Z");

const createCashflowsWithoutToday = () => [
  {
    date: new Date("2024-01-01T00:00:00.000Z"),
    amount: -100000,
  },
  {
    date: new Date("2025-01-01T00:00:00.000Z"),
    amount: -10000,
  },
];

const createCashflowsWithToday = () => [
  {
    date: new Date("2024-01-01T00:00:00.000Z"),
    amount: -100000,
  },
  {
    date: new Date("2026-06-29T00:00:00.000Z"),
    amount: -5000,
  },
];

const createEmptyCashflows = () => [];

module.exports = {
  mockIds,
  mockSession,
  mockCurrentValue,
  fixedToday,
  fixedTodayMidnight,
  createCashflowsWithoutToday,
  createCashflowsWithToday,
  createEmptyCashflows,
};